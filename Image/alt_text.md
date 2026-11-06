# Alt text and long descriptions for the architecture diagrams

Use the short text as the image alt text and the long text as a caption or appendix description.

## Figure 1: System context view (images/01_context.png)
Short: Context diagram showing the Coordinator and Facilitator using the STEMMate web app, which receives files from a static host, sends queued operations to an in-browser mock sync API, and exports or restores a backup file.
Long: The Coordinator signs in and adds Facilitators. The Facilitator signs in, creates tasks, syncs and backs up. A local administrator (unconfirmed) handles setup, backup and reset. The static host serves the app files. The app sends queued operations to the mock sync API, which answers with status codes 200, 400, 409, 422 or 503. The app exports a JSON backup file and can restore from it.

## Figure 2: Container view (images/02_container.png)
Short: Container diagram of the browser front-end, IndexedDB, sessionStorage and the in-memory mock sync API, with a static host and a backup file outside the device.
Long: Inside the user's browser, the front-end stores tasks, the queue, users and roles in IndexedDB and keeps the current username and role in sessionStorage. It sends operations to an in-memory mock sync API. The static host supplies the app files, and the front-end exports and restores a backup file.

## Figure 3: Component view (images/03_component.png)
Short: Layered component diagram in which the UI reaches repository, queue, sync and export modules only through planService, with auth.js and db.js beneath.
Long: The UI layer holds editor, validation, task list, dialog, status, connection and message modules. The editor and task list call the planService facade, which calls repository, queue, sync and export. Repository and queue use db.js (IndexedDB). Sync also calls the mock sync API. auth.js handles sign-in and roles and also uses db.js; its detail is unconfirmed.

## Figure 4: Deployment view (images/04_deployment.png)
Short: Deployment diagram showing everything running inside the user's browser, with a Vercel static host delivering app files and an unconfirmed USB or Wi-Fi copy.
Long: The trust boundary is the user's device. In the browser sit the app, the IndexedDB data and the mock sync API. The Vercel host sends only app files over HTTPS. An offline installation by USB or local Wi-Fi is possible but unconfirmed.

## Figure 5: Sequence for save, offline, sync and conflict (images/05_sequence_sync.png)
Short: Sequence diagram of saving a task, queueing it offline, then syncing and handling success, conflict or error responses.
Long: The UI calls savePlan, which validates, saves the task as pending and enqueues an operation. When online, the user syncs; sync sends each queued operation with its ID to the mock API. A 200 or duplicate response marks the task synced and removes the operation. A 409 marks a conflict. A 400, 422 or 503 records the error and keeps the operation. For a conflict the user chooses their version or the server version.

## Figure 6: Queue operation states (images/06_state_queue.png)
Short: State diagram of a queued operation moving from pending to complete, back to pending on failure, or to conflict and then resolved.
Long: A saved task becomes a pending operation. A failed sync keeps it pending with an error recorded. A 200 or duplicate response completes and removes it. A 409 moves it to conflict, and the user's choice moves it to resolved.
