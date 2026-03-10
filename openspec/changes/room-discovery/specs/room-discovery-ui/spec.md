## ADDED Requirements

### Requirement: Display discovered rooms on transfer page
The system SHALL display a list of currently active rooms on the transfer page (`/transfer`). The list SHALL be updated by polling every 3 seconds.

#### Scenario: Active rooms are discovered
- **WHEN** the user opens the transfer page and there are active rooms
- **THEN** the system displays a "发现的房间" section above the create/join options
- **THEN** each room is shown as a clickable card with the room code
- **THEN** clicking a room card initiates joining that room

#### Scenario: No active rooms
- **WHEN** the user opens the transfer page and there are no active rooms
- **THEN** the "发现的房间" section is not displayed
- **THEN** the user sees only the create/join options as before

#### Scenario: Discovered room is no longer available
- **WHEN** the user clicks a discovered room card but the room has already been closed
- **THEN** the system shows an error message "房间已关闭或已过期"
- **THEN** the room list refreshes to remove the stale entry

### Requirement: Room creation stays on page with room code display
The system SHALL NOT immediately navigate to the room page after creating a room. Instead, it SHALL display the room code prominently and wait for a peer to connect.

#### Scenario: Host creates a room and waits
- **WHEN** the user clicks "创建房间"
- **THEN** the system displays the room code in large text with a copy button
- **THEN** the system shows a waiting animation/message ("等待对方加入...")
- **THEN** the user remains on the transfer page (no route navigation)

#### Scenario: Peer connects to the room
- **WHEN** a peer successfully connects to the host's room (connectionState becomes "connected")
- **THEN** the system automatically navigates to `/transfer/room?room={code}`

### Requirement: Polling lifecycle management
The system SHALL start polling for rooms when the transfer page mounts and stop when it unmounts or when the user enters room creation/join mode.

#### Scenario: Page mount starts polling
- **WHEN** the transfer page mounts and the user is in "choose" mode
- **THEN** the system starts polling `GET /api/rooms` every 3 seconds

#### Scenario: Page unmount stops polling
- **WHEN** the user navigates away from the transfer page
- **THEN** the polling interval is cleared

#### Scenario: Creating or joining stops polling
- **WHEN** the user enters room creation mode or join mode
- **THEN** the polling stops (no need to discover rooms while creating/joining)
