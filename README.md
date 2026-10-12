# Rick Memes

Rick Memes is a Next.js app with PostgreSQL, Drizzle ORM, a private-site passphrase gate, admin controls, and media uploads stored on a mounted local directory.

## Production rollout

The recommended rollout is:

1. Build and push two versioned Docker Hub images: the app image and a migration image.
2. Have the platform partner provide PostgreSQL, a persistent volume for uploaded media, HTTPS ingress, and runtime environment variables.
3. Run the Drizzle migration Job once for each release before updating the app Deployment.
4. Deploy the app image and mount the persistent volume at `/app/uploads`.

Do not run a separate SQL init script as well as Drizzle migrations. The migration image uses the checked-in SQL files and Drizzle's migration journal to know what has already run. There is no seed step; the database starts empty.

## Build and push to Docker Hub

The public repository is `markbrouwer/rick-memes`. Use a new version tag for each release.

```powershell
$Image = "markbrouwer/rick-memes"
$Version = "1.0.0"

docker login --username markbrouwer

docker build --target runner -t "${Image}:${Version}" .
docker build --target database -t "${Image}:${Version}-migrate" .

docker push "${Image}:${Version}"
docker push "${Image}:${Version}-migrate"
```

`docker login` prompts for credentials. Use a Docker Hub access token; do not add credentials to this README, command history, or image build arguments.

The `runner` image runs the website on port `3000`. The `database` image contains the Drizzle CLI, migration configuration, and checked-in migrations; Kubernetes runs it as a one-shot Job.

## Runtime configuration

Provide these values to the app at runtime. Put secrets in the platform's Secret manager/Kubernetes Secret, not in the image or a committed manifest.

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection URL, for example `postgresql://USER:PASSWORD@HOST:5432/DATABASE`. Use the TLS options required by the PostgreSQL provider. Supply this to both app and migration Job. |
| `ACCESS_ANSWER` | Yes | Answer to the private-site question. Comparison ignores case and surrounding whitespace. |
| `ACCESS_SESSION_SECRET` | Yes | Long, random signing key for access cookies. Use at least 32 random bytes and keep the same value across app replicas. |
| `UPLOAD_DIR` | Yes | Set to `/app/uploads`; mount persistent storage at this exact path. |
| `ACCESS_QUESTION` | No | Question shown on the access page. Defaults to `Wat is de naam van Rick zijn hond?`. |
| `ADMIN_PASSPHRASE` | No | Separate passphrase for admin mode and deleting posts. |

`NODE_ENV=production`, `HOSTNAME=0.0.0.0`, and `PORT=3000` are set in the app image. Expose the app through HTTPS; access cookies are marked secure for HTTPS requests.

The answer and signing key are intentionally not given defaults. If either is missing, private-site access cannot be configured and visitors will not get access.

## Kubernetes rollout

The examples below assume a Secret named `rick-memes-runtime` with `DATABASE_URL`, `ACCESS_ANSWER`, `ACCESS_SESSION_SECRET`, and optionally `ADMIN_PASSPHRASE`. Create it using your cluster/platform secret manager. Do not commit its values.

### 1. Run the migration Job

Use a unique Job name for each release. Update the version tag before applying:

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: rick-memes-migrate-v1-0-0
spec:
  backoffLimit: 2
  template:
    spec:
      restartPolicy: Never
      containers:
        - name: migrate
          image: markbrouwer/rick-memes:1.0.0-migrate
          imagePullPolicy: IfNotPresent
          command: ["npm", "run", "db:migrate"]
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: rick-memes-runtime
                  key: DATABASE_URL
```

Apply the Job and wait for success before deploying the new app version:

```powershell
kubectl apply -f rick-memes-migrate.yaml
kubectl wait --for=condition=complete job/rick-memes-migrate-v1-0-0 --timeout=120s
```

Check failures with `kubectl logs job/rick-memes-migrate-v1-0-0`. If retrying a failed/completed release Job, delete that Job and recreate it, or use a new versioned Job name. Never delete the PostgreSQL data volume to rerun migrations.

### 2. Deploy the app

Create a PersistentVolumeClaim using a storage class provided by the platform, then mount it at `/app/uploads`. The app runs as UID/GID `1001`; configure volume ownership or `fsGroup` so it can write there.

Example Deployment template (update the image version and claim name as needed):

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: rick-memes
spec:
  replicas: 1
  selector:
    matchLabels:
      app: rick-memes
  template:
    metadata:
      labels:
        app: rick-memes
    spec:
      securityContext:
        fsGroup: 1001
      containers:
        - name: app
          image: markbrouwer/rick-memes:1.0.0
          imagePullPolicy: IfNotPresent
          ports:
            - name: http
              containerPort: 3000
          envFrom:
            - secretRef:
                name: rick-memes-runtime
          env:
            - name: ACCESS_QUESTION
              value: "Wat is de naam van Rick zijn hond?"
            - name: UPLOAD_DIR
              value: /app/uploads
          volumeMounts:
            - name: uploads
              mountPath: /app/uploads
      volumes:
        - name: uploads
          persistentVolumeClaim:
            claimName: rick-memes-uploads
```

Expose port `3000` through a Kubernetes Service and HTTPS Ingress. Start with one app replica unless the uploads storage supports shared read/write access; all replicas must see the same `/app/uploads` files. Back up both PostgreSQL and the uploads volume.

### 3. Verify

- Migration Job completed successfully.
- App Pod is ready and can connect to PostgreSQL.
- HTTPS site presents the configured Dutch question.
- Correct answer grants access; the memes API returns `401` before access is granted.
- Upload an image and video, restart the app Pod, and confirm both still load.
- Admin mode works only when `ADMIN_PASSPHRASE` is configured.

## Local development

Create `.env.local` from `.env.example`, set local credentials and secrets, then run:

```powershell
npm run docker:up -- --detach
```

This starts PostgreSQL, applies pending Drizzle migrations, and runs the app. Uploaded media is stored in the Compose `uploads_data` volume. Avoid `docker compose down -v` unless you intend to delete local database and upload data.

## Schema changes

Change `src/db/schema.ts`, generate a migration, commit the generated files under `drizzle/`, and deploy the matching migration image/Job before the app rollout:

```powershell
npm run db:generate
```

Never edit an already-applied migration; add a new migration instead.