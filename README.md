# Against the Storm wiki
A tool that suggests updates to the official wiki based on the current game files.

## Usage
The following assumes a Windows Steam installation of AtS:
1. Ensure you have `node` installed and `npm install` is run.
2. Unpack the latest release of [AssetRipper](https://github.com/AssetRipper/AssetRipper/releases) into `/tools/AssetRipper`.
3. Use `npm run datamine` to unpack the game files into `/input/game`.
4. Use `npm run download` to update the local snapshot of the online wiki into `/input/wiki`.
5. Use `npm run suggest` to spawn a fresh wiki into `/output`, along with a report html file.

Alternatively, you can use `npm run start` to call the above `npm run` steps in succession.

## Unity asset file format
This section is currently not used, because we opted to use [AssetRipper](https://github.com/AssetRipper/AssetRipper) instead. 
We'll leave it here in case we implement a direct reading of the game files.
### First block
| Bytes | Description                                     |
|-------|-------------------------------------------------|
| 4     | Old metadata size                               |
| 4     | Old file size                                   |
| 4     | Generation. Has value "22", meaning unity 2020  |
| 4     | Old data offset.                                |
| 4     | Endianess and zeroes                            |
| 8     | File size                                       |
| 8     | Data offset                                     |
| 8     | Unknown                                         |
| N     | Signature, as UTF8 zero terminated string       |
| 4     | Platform                                        |
| 1     | Enable type tree. Zero                          |
| 4     | Count of types                                  |
|       | ................ Type begin ...............     |
| 4     | Raw type id                                     |
| 1     | Is script type                                  |
| 2     | Script type index                               |
| (16)  | Script id, sometimes (e.g. type 114), as 4 uint |
| 16    | Old type hash, as 4 uint                        |
|       | ................ Type end ...............       |
| 4     | Count of objects                                |
| 1     | Alignment                                       |
|       | ................ Object begin ...............   |
| 8     | File id                                         |
| 8     | Byte start                                      |
| 4     | Byte size                                       |
| 4     | Serialized type index                           |
|       | ................ Object end ...............     |
