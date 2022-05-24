import { createMachine } from 'xstate';
import { log, sendParent } from 'xstate/lib/actions';

export const AppMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QEEAOqCyBDAxgCwEsA7MAOgBsB7LCYqAYgGEAlAUWQBVWB9RgCU6JQqSrAIAXApSJCQAD0QBGACwB2UgAYATDrUBmFcoCsBrQBoQAT0SqAbKRMAOI6uVbFj1UYC+3i2kxcQhIKaloiBgApAHkASQA5XgEOWRExSWlZBQQVdW1dVQNlY1MLaxyATi1SZQrbT1UtIw0K5UVW3z8QIkoIOFkA7HxiMioaOlTRCSkZJHlENzKlRXVm5UdbO1t2rQq9X390IeCyPmiAZRS5tOnMuey9bVIKisdHHUcNDVsjW1slnKKRSkVyOZR6DZNNQtVQHECDIIjUjnAAyyAAaqxJukZllEI9qi83h8vj8-gCdOpVN9XIofltdlo4QjhiRsbdZqBsh4AR5Ot4gA */
  createMachine({
    tsTypes: {} as import('./app.typegen').Typegen0,
    id: 'AppMachine',
    initial: 'loading',
    states: {
      loading: {
        on: {
          CREATE_CHAT: {
            actions: [sendParent('UPDATE'), log('GOT CREATE CHAT')],
            target: 'HOST',
          },
          JOIN_CHAT: {
            actions: [sendParent('UPDATE'), log('GOT JOIN CHAT')],
            target: 'SLAVE',
          },
        },
      },
      HOST: {},
      SLAVE: {},
    },
  });
