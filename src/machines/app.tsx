import { createMachine } from 'xstate';
import { log, sendParent } from 'xstate/lib/actions';

export const AppMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QEEAOqB0AbA9gQwgEsA7KAYgGEAlAUWQBUaB9CgCQcVFR1kIBdCOYpxAAPRACYJATgwBWACwAGaQoDsagBwA2AIybdAZgA0IAJ6JphjEoXrD0iUqW6Xc6QF8PptJlwEScgApAHkASQA5FnZ6EW5eASERcQQJRQxtBTldCUNtNRzNaVMLBF05JQxdNQk1B1y1BRkvbxBiHAg4EV9sfCJSOJ5+QWEkMUQmksQdeWUdQyVDApVDTS8fdAxWEIBlWLH44aSxlKbKxwVpbQltbUM5Jd0FKYQZxSV5xeWrNdaenYAMsgAGo0QYJEbJCYSXQ2ZRSOppRQGEzmRC6bRyDAOJ4GTSaOTaTS2dYgXzgo6jUApfQvIyzaSOCSaOp6cpaFoeIA */
  createMachine({
    tsTypes: {} as import('./app.typegen').Typegen0,
    id: 'AppMachine',
    initial: 'loading',
    states: {
      loading: {
        on: {
          CREATE_CHAT: {
            target: 'HOST',
            actions: [sendParent('UPDATE'), log('GOT CREATE CHAT')],
          },
          JOIN_CHAT: {
            target: 'SLAVE',
            actions: [sendParent('UPDATE'), log('GOT JOIN CHAT')],
          },
        },
      },
      HOST: {},
      SLAVE: {},
    },
  });
