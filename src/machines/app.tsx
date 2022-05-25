import { createMachine } from 'xstate';
import { log, respond, sendParent } from 'xstate/lib/actions';

export const AppMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QEEAOqCyBDAxgCwEsA7MAOgBsB7LCYqAYgGEAlAUWQBVWB9RgCU6JQqSrAIAXApSJCQAD0QBGABwAmUgFYAnMq0A2LYq1aNpvcoA0IAJ6ItABlLH7yvQHY9AFkWedntwC+AVZomLiEJBTUtEQMAFIA8gCSAHK8AhyyImKS0rIKCCrq2roGRiZmljaIqvZ6Tr6qior2AMx6GuaenkHBIESUEHCyodj4xGRUNHRZohJSMkjyiJ6qVraFqm6kiq1abq32nsoaim7eekEh6GMRZHwJAMqZS9nzeUsFra3Kmm6m3nsGlazWUrXWShUTnOelablU3WOLg0VxAo3CE1IjwAMsgAGqsWY5Bb5RDfX4af4aQHA0Hg6oIVStTxOVqqHR1Pamez-VHo8YkInvRagAoqCGFZS9AJAA */
  createMachine(
    {
      tsTypes: {} as import('./app.typegen').Typegen0,
      id: 'AppMachine',
      initial: 'loading',
      states: {
        loading: {
          on: {
            CREATE_CHAT: {
              actions: 'update',
              target: 'HOST',
            },
            JOIN_CHAT: {
              actions: 'update',
              target: 'SLAVE',
            },
          },
        },
        HOST: {},
        SLAVE: {},
      },
    },
    {
      actions: {
        update: sendParent('UPDATE'),
      },
    },
  );
