# mscache: Key-Value Store

`mscache` is a simple and efficient key-value store written in TypeScript, designed to work over TCP. It provides a lightweight solution for managing key-value data with support for these fundamental data structures: String, Hash, and List.

## Installation

- It's in development; currently, no binaries are available.

### Clone the Repo
```bash
git clone https://github.com/BandaySajid/mscache
```

### Install dependencies (dev)
```bash
npm install
```

## Usage

To use `mscache`:

### Start the server
```bash
npm run dev
```

- You can use any TCP client to connect to `mscache` (PORT: 9898) for now; here we will be using netcat.

```bash
nc 127.0.0.1 9898
```

### String Operations

#### Set a String Value

- set <key> <value>

```bash
set name mscache
```

#### Get a String Value

- get <key>

```bash
get name
```

### Hash Operations

#### Set a Hash Field

- hset <key> <field_key> <field_value>

```bash
hset someUser name msCacheUser email msUser@example.com age 18
```

#### Get a Hash Field

- hget <key> <field_key>

```bash
hget someUser name
```

#### Delete Hash Fields

- hdel <key> <field_key1> <field_key2> <field_key3>

```bash
hdel someUser name email age
```

### List Operations

#### Append to a List

- append <key> <element1> <element2>

```bash
append users field1 field2 field3
```

#### Prepend to a List

- prepend <key> <element1> <element2>

```bash
prepend users field1 field2 field3
```

#### Pop from the Left of a List

- popL <key> <count>

```bash
popL users 2
```

#### Pop from the Right of a List

- popR <key> <count>

```bash
popR users 1
```

#### Slice a List

- slice <key> <start_index> <end_index>

```bash
slice users 0 5
```

### Global Operations

#### Delete Keys

- del <key1> <key2> <key3>

```bash
del key1 key2 key3
```

#### Setting expiration for keys.

- set <key> ex <seconds>

```bash
set name Halfi ex 9
```

## Contributing

Feel free to contribute to the project by opening issues or submitting pull requests on our [GitHub repository](https://github.com/BandaySajid/mscache).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
