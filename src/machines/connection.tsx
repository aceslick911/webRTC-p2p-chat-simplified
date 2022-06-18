import { createMachine } from 'xstate';
import { log, sendParent } from 'xstate/lib/actions';

export const ConnectionMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QGMD2A7dZkBcCWGsAdHhADZgDEAwgPIBy9AotQCqKgAOqse+GHEAA9EAZgAsATiIAmGQAZJM0QHYAjCpmaZAGhABPRGpkA2WSoCs8gBxqL1k-I1q1AX1d60mbP3TEvWLh46FA0DMxsAPoAygCq1NRM0dGC3Ly+giIIMhaiRCrW1nKSko5q4vK6BogyUkQWFuLl1iomTc3unhiBvv7dPsGhdIwsrACSDJEAYgCCYwAyTAAiqTx8BOiZRk5Ehdby4oe29qKianqGCBJqRIfi1uIWJiaiT0-uHiDoqBBwggEDQgkchgVbpDZbBDiKqXFTSJQqRSveT2CySUTWTogAFBIE4-AhMHrARIYSIEzWIiieTUywtWqPUSSC41Nq7eTyOEmGRqSSKR7iLH4jZ9by4SBEjKkrKiGTSGzQ+72cQFCwqFQsq4SIiSCqSJ6cuxPSQqIX9XF+IgAMwAhngKBBWKhqOacJKIdKjHJbjIHooDvq1EVNe0iG0VSYVKdKuizWLeu6SaAskHNWZ0SY1C9XhSJK1rBYPq4gA */
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
          CONNECT_SUCCESS: {
            target: 'connected',
            actions: [sendParent('UPDATE'), log('connected')],
          },
          CONNECTION_FAILED: {
            target: 'failedToConnect',
            actions: [sendParent('UPDATE'), log('connected')],
          },

          setupChannelAsAHost: '.host',
          setupChannelAsASlave: '.slave',
        },
        states: {
          host: {
            on: {
              createOffer: {},
              setAnswerDescription: {},
            },
          },
          slave: {
            on: {
              createAnswer: {},
            },
          },
        },
      },
      connected: {
        on: {
          sendMessage: {},
        },
      },
      failedToConnect: {},
    },
  });
