export const IDL = {
    "version": "0.1.0",
    "name": "engage_token",
    "instructions": [
      {
        "name": "createTokenAccount",
        "accounts": [
          {
            "name": "tokenAccount",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "owner",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "systemProgram",
            "isMut": false,
            "isSigner": false
          }
        ],
        "args": []
      },
      {
        "name": "createTask",
        "accounts": [
          {
            "name": "taskAccount",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "creator",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "systemProgram",
            "isMut": false,
            "isSigner": false
          }
        ],
        "args": [
          {
            "name": "tokenAmount",
            "type": "u64"
          },
          {
            "name": "deadline",
            "type": "i64"
          }
        ]
      },
      {
        "name": "verifyEngagement",
        "accounts": [
          {
            "name": "task",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "participant",
            "isMut": true,
            "isSigner": true
          }
        ],
        "args": [
          {
            "name": "engagementProof",
            "type": "string"
          }
        ]
      }
    ],
    "accounts": [
      {
        "name": "TokenAccount",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "owner",
              "type": "publicKey"
            },
            {
              "name": "balance",
              "type": "u64"
            }
          ]
        }
      },
      {
        "name": "Task",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "creator",
              "type": "publicKey"
            },
            {
              "name": "tokenAmount",
              "type": "u64"
            },
            {
              "name": "deadline",
              "type": "i64"
            },
            {
              "name": "completed",
              "type": "bool"
            }
          ]
        }
      }
    ]
  };