import { createMachine } from 'xstate';
import { log, sendParent } from 'xstate/lib/actions';

export const ConnectionMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QGED2A7dYDGAXAlhgLICG2AFvlgHT4QA2YAxMgPIBy7AosgCqKgADqlj4CGASAAeiAIwA2AAzUAHIoBMitQFYA7IoCc8+et0AaEAE9E2g+urqAzCvm7Zi3QffqDAX18WaJg44uikFFRg1NgYWHhUUNTkIrjUqABm6WAATsjZYCS4kEywYLgAguiwAO45ACJw2Nn4gqGSwqJtSNKILgAs1Loqun1K8trOKo59FtYIzgOOiqMmBtrD6vJ+ASBBcaHhlDQxwfHoicmwqdUkYgkAYqi55CTB9EwUr1j0AJJVuK9sFEMKhBGB0O0RHcJN0ZAh3K5Bn0DPoDCo1E49LNEI5ptRceo+n1tBN5LI9PJ-IFYiFCGEyEcoid9gkkikPvlCmBWJkcpDOnTJHCSfJ8cijLptPJRrJHNpsfMVItlsYfOtdJtttTTgcGZFojSzolYPQSAA3KKvGo5ABKBQgliYVtq+QgPKy2X50IhsLk4wMDj66hUwdsfRUtnlVhxSvxKtW6s1VN2ht1EWOqdZJvNURud3Oj2eXzA70+bz+V0BwPQoPBXq6oDhshUsuoJLscqMinJjgVuMWjkJxNJ5N0lJ2e1pxD1GZ1WdNFo5BSKlWtnu6HW9QrkuOUHjJLg16lkx970cVypWao2W2Tk-i0-TTMz5xYHG4fAA+gBlACqyGQLhv2-etBV9eETwGCNPHkJVNjHYkFW0ZtqD6bsNE8FxFGQlQ70zR9GQNOdXzYTgeF4H4OE-e5yh+AAZLg6lAmFGzkcNtDbaCDEUcYdBmc8cNQ9DTDRJQcLwucCP1ZlaVfUpcAAV0EZAXjecpYHKAAJFJmJ9ViEGQ3RVFMEMSUcOxFGWBVmygyVDCWaVkWgiSWSk2cWTksolJU4t6HU8pvwXMBdO3eFg1kagtFDIwlT0clrP0Bx0V0FKQ0xbQ+kcFyp3pJ8iP2SBoheXACFfb8uHYOpqPorgQvAtEOPRMMNRRbR1BJBVPAi2QDDRMdRPanjsofXLCJkvBCs+EqEiYG0eC4H4ADUuGqhi6v0k9WzsNCSX6tFpk6rxqB63rMqcQwDHM4a0zG1NilKdAICIOBYBIGB1p6eE5Q47tbEUcypklM85n0ZRB2bWQTr6MdkOuulDmku6IA+VTvgrAF0CBNJ0AAWxet7go3KEG0+yHTFUIk1iVAxRlxeROss-FjxbKGYdkfwdhrCA4Eke8bv1OhGA+uEgyQlwHGmfrHHJDLBzhtzn2Ii4UjSXlck5IoIGFxBYJUagTAjXrkPkXcozmRwhjjfdIbWBQNXl0bEaVtkrmoPNSqgQsfLebX4R4vWnEw6DHCUdq+2GBw1ga-6nEuh2Efc2TlauX2JnsaZetcKUZTlBVCQDEPIeltqQ0meOZ0VjzjSC6hnVte05iEYmwI26G9dkSVZS8UTbD7S2lmtnrjftid8MdxOjWobMLTd24Pa91GS19iGBmWTvRgmZC0XDoy1WjwdzKy0fJPHyuk6noLl4cyKx2bVx1GPU88+RfEyVlclgycdFy7y8aPd95EjhjJDHahMCyVlzwRnxB3TKzgFAtn0EfbUrlT75RCJNYq-8iYChYp9VqDhXBBmRBoS6PVOruGoHYWwSw064iMD-W6OpCoPQgA8fAQtsFbnAu4OwlC3DYTDMiY2CphgRRgsiYkD80KeAYU7AqEBqD5CBPgM0bCOFNxwXpUm4UHBSm0NhbiadMoiLcIMIwEi2qEg8FqFMJ8E5nwmlrThJM4S2wISMfOJDpYGAVCbIyawZTjCHJoGxfN4YV2oOkW4jAIC8FQHzZeuhcQEOGOsCxthzACWJKoEYaJ-pkjMrhY+KD7HLxUNZdOowtBojJkMEwfQOa+CAA */
  createMachine({
    tsTypes: {} as import('./connection.typegen').Typegen0,
    id: 'ConnectionMachine',
    initial: 'idle',
    states: {
      idle: {
        on: {
          CONNECT: {
            target: 'connecting',
          },
        },
      },
      connecting: {
        on: {
          setupChannelAsAHost: {
            target: '.host',
          },
          setupChannelAsASlave: {
            target: '.slave',
          },
          CONNECT_SUCCESS: {
            actions: [sendParent('UPDATE'), log('connected')],
            target: 'connected',
          },
          CONNECTION_FAILED: {
            actions: [sendParent('UPDATE'), log('connected')],
            target: 'failedToConnect',
          },
        },
        states: {
          host: {
            on: {
              offerCreated: {
                target: '.offerCreated',
              },
            },
            states: {
              offerCreated: {
                on: {
                  setAnswerDescription: {
                    target: 'waitingForChannel',
                  },
                },
              },
              waitingForChannel: {
                on: {
                  'channelInstance.onopen': '..connected',
                },
              },
            },
          },
          slave: {
            on: {
              createAnswer: {
                target: '.answerReady',
              },
            },
            states: {
              answerReady: {
                on: {
                  answeredOffer: {
                    target: 'waitingForChannel',
                  },
                },
              },
              waitingForChannel: {
                on: {
                  'channelInstance.onopen': '..connected',
                },
              },
            },
          },
        },
      },
      connected: {
        initial: 'chatting',
        states: {
          chatting: {
            on: {
              SEND_FILE: {
                target: 'sendingFile',
              },
              RECEIVE_FILE: {
                target: 'receivingFile',
              },
            },
          },
          sendingFile: {},
          receivingFile: {},
        },
        on: {
          sendMessage: {},
          'channelInstance.onmessage': {},
        },
      },
      failedToConnect: {},
    },
  });
