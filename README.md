
# CatBox

### Start Server / REPL

Execute index.js to begin.

```
$ node index                    # listen to `localhost` on port 80 (http)
$ node index my.host.name       # specify hostname
$ node index my.host.name http  # specify hostname and protocol
```

Note: Port is set automatically based on protocol unless set as an environment variable.

### REPL Commands

Create four-member chat with topic "Let's chat!".

```
>> chat.create(4, "Let's chat!")
Generating chat...
 Chat ID: 224c81a6-2c3c-4541-a72a-52dd4701784d
 URLs:
  http://localhost/224c81a6-2c3c-4541-a72a-52dd4701784d/1e177abf-9b25-444c-9f7f-a42d2da43a1c
  http://localhost/224c81a6-2c3c-4541-a72a-52dd4701784d/2a81e70a-5ca1-47ec-bfbf-82836871da42
  http://localhost/224c81a6-2c3c-4541-a72a-52dd4701784d/cd1a7be4-24f6-43c6-9a76-4f6e39fd3278
  http://localhost/224c81a6-2c3c-4541-a72a-52dd4701784d/1ba38465-dfdf-400d-b24e-ce30cf9de622
```

Delete previous chat using ID

```
>> chat.delete("224c81a6-2c3c-4541-a72a-52dd4701784d")
Deleted chat "224c81a6-2c3c-4541-a72a-52dd4701784d"
```