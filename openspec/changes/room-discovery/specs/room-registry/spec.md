## ADDED Requirements

### Requirement: Room registration on creation
The system SHALL register a room code to the server-side room registry when a host creates a new room. The registration SHALL include the room code and a timestamp.

#### Scenario: Host creates a room
- **WHEN** a user creates a new transfer room
- **THEN** the system sends a POST request to `/api/rooms` with the room code
- **THEN** the room code and current timestamp are stored in Cloudflare KV under key `active-rooms`

#### Scenario: Registration failure does not block room creation
- **WHEN** the POST request to `/api/rooms` fails (network error, server error)
- **THEN** the room creation still succeeds (PeerJS connection is independent)
- **THEN** the room will not appear in discovery but can still be joined manually

### Requirement: Room listing
The system SHALL provide an API endpoint to list all currently active rooms. Rooms older than 30 minutes SHALL be excluded from the response and cleaned up.

#### Scenario: List active rooms
- **WHEN** a GET request is made to `/api/rooms`
- **THEN** the system returns a JSON array of active room objects `[{ code, createdAt }]`
- **THEN** rooms with a `createdAt` older than 30 minutes are excluded from the response

#### Scenario: No active rooms
- **WHEN** a GET request is made to `/api/rooms` and no rooms are registered (or all are expired)
- **THEN** the system returns an empty array `[]`

### Requirement: Room deregistration on disconnect
The system SHALL deregister a room from the registry when the host disconnects.

#### Scenario: Host disconnects normally
- **WHEN** the host clicks "断开" or navigates away from the room
- **THEN** the system sends a DELETE request to `/api/rooms/[code]`
- **THEN** the room code is removed from the `active-rooms` KV entry

#### Scenario: Host closes browser without disconnecting
- **WHEN** the host closes the browser tab or window
- **THEN** the `beforeunload` event triggers a deregistration attempt via `navigator.sendBeacon`
- **THEN** if the beacon fails, the room expires after 30 minutes via KV TTL

### Requirement: KV storage uses single-key design
The system SHALL store all active rooms in a single KV key `active-rooms` as a JSON object `{ [code]: timestamp }` to ensure strong read consistency.

#### Scenario: Concurrent reads see latest data
- **WHEN** a room is registered and another device immediately reads the room list
- **THEN** the newly registered room appears in the response (strong consistency via single-key `get`)
