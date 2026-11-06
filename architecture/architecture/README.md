# Architecture source files (Armindo Bauleth, 225058618)

Mermaid sources for the A4 architecture views, plus the master traceability matrix.

| File | Content |
|---|---|
| 01_context.mmd | System context view |
| 02_container.mmd | Container view (final build per Deon, 6 Nov) |
| 03_component.mmd | Component view |
| 04_deployment.mmd | Deployment view and trust boundary |
| 05_sequence_sync.mmd | Sequence: save, offline, sync, conflict |
| 06_state_queue.mmd | Queue operation state machine |
| traceability_matrix.csv | Requirement, component, test, result, issue |

Open .mmd files with any Mermaid viewer (for example mermaid.live) and export as images.
Items marked unconfirmed depend on the final build source.
Results come from Nicholas's Test Execution Record (3 Nov, stemmatea4 build), not the final build.

Update 6 Nov: the matrix now has a redesign column (R1 to R5) and notes the two residual risks from the final evaluation (data stays on one device; backups are unencrypted).
