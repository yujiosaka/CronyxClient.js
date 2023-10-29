# API reference

## Table of Contents

- [CronyxClient Class](#cronyxclient-class)
  - [Constructor](#constructor)
  - [Methods](#methods)
- [Job Class](#job-class)
  - [Properties](#properties)
  - [Methods](#methods-1)

## CronyxClient Class

The `CronyxClient` class is responsible for managing the lifecycle of jobs, initiating, and executing tasks based on given criteria.

### Constructor

```ts
constructor(options: CronyxClientOptions)
```

**Parameters**:

- `options`:
  - `url`: [string] - CronyxServer's location (e.g. `"http://localhost:3000/"`)
  - `credentials` (**optional**):
    - `username`: [string] - CronyxServer's basic authentication user name
    - `password`: [string] - CronyxServer's basic authentication password

### Methods

#### `requestJobStart`

Initiate the job based on the specified criteria.

```ts
requestJobStart(options: JobStartOptions): Promise<Job>
```

**Parameters**:

- `options`:
  - `jobName`: [string] - A unique identifier for the series of jobs.
  - `jobInterval`: [Duration] | [string] | [number] - Specifies how frequently the job runs.
  - `startBuffer?` (**optional**): [Duration] | [number] - Adds a delay before the job starts.
  - `retryInterval?` (**optional**): [Duration] | [number] - Allows bypassing of an active job lock after a specified period.
  - `requiredJobNames?` (**optional**): [Array]<[string]> - Specifies dependencies using their job names.
  - `timezone?` (**optional**): [string] - Overrides `timezone` of the constructor argument.
  - `noLock?` (**optional**): [boolean] - Bypasses job locks, letting other processes run the job.
  - `jobIntervalStartedAt?` (**optional**): [Date] - Sets the start interval manually. Use with the `noLock` option.

#### `requestJobExec`

Execute a specified task for a job, often used when a specific task needs to be run without considering the full job lifecycle.

```ts
requestJobExec(options: JobStartOptions, task: (job: Job) => Promise<void>): Promise<Job>
```

**Parameters**:

- `options`: Same as described in `requestJobStart`.
- `task`: Function that defines the task to be executed for the job.

## Job Class

The `Job` class encapsulates individual tasks managed and executed by Cronyx.

### Properties

- `id`: [string] | [null] - A unique identifier for the job, returns `null` for bypassed job lock.
- `name`: [string] - The identifier for the series of jobs.
- `interval`: [number] - The frequency of the job in milliseconds.
- `isActive`: [boolean] - The active status of the job.
- `intervalStartedAt`: [Date] - Starting time of the job's interval.
- `intervalEndedAt`: [Date] - Ending time of the job's interval.
- `createdAt`: [Date] - Created date of the job.
- `updatedAt`: [Date] - Last updated date of the job.

### Methods

#### `finish`

Mark a job as successfully completed.

```ts
finish(): Promise<void>
```

#### `interrupt`

Indicate that a job has been prematurely halted, either due to an error or another unforeseen circumstance.

```ts
interrupt(): Promise<void>
```

[null]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/null "null"
[Array]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array "Array"
[boolean]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Boolean_type "Boolean"
[number]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type "Number"
[string]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type "String"
[Date]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/Date "Date"
[Duration]: https://date-fns.org/v2.30.0/docs/Duration "Duration"
