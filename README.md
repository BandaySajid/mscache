# mscache: Key-Value Store

`mscache` is a simple and efficient key-value store written in TypeScript, designed to work over TCP. It provides a lightweight solution for managing key-value data with support for these fundamental data structures currently: String, Hash, and List.

## Installation

-  It's in development, currently no binaries are available.

### Clone the Repo
```bash
git clone https://github.com/BandaySajid/mscache
```

### Install dependencies(dev)
```bash
npm install
```

## Usage

To use `mscache`:

### Start the server
```bash
npm run dev
```

- You can use any `TCP` client to connect to mscache (PORT:9898) for now; here we will be using netcat.

```bash
nc 127.0.0.1 9898
```

### String Operations

#### Set a String Value

```bash
set name mscache
```

#### Get a String Value

```bash
get name
```

### Hash Operations

#### Set a Hash Field

```bash
hset someUser name msCacheUser email msUser@example.com age 18
```

#### Get a Hash Field

```bash
hget someUser name
```

#### Delete Hash Fields

```bash
hdel someUser name email age
```

### List Operations

#### Append to a List

```bash
append users field1 field2 field3
```

#### Prepend to a List

```bash
prepend users field1 field2 field3
```

#### Pop from the Left of a List

```bash
popL users 2
```

#### Pop from the Right of a List

```bash
popR users 1
```

### Global Operations

#### Delete Keys

```bash
del key1 key2 key3
```

## Contributing

Feel free to contribute to the project by opening issues or submitting pull requests on our [GitHub repository](https://github.com/BandaySajid/mscache).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
