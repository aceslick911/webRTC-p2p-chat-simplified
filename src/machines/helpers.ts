import { isPromiseLike } from 'xstate/lib/utils';

const defaultServiceEnd = 'SERVICE_END';
const defaultEndEvent = 'ERROR';

export const machineService = <ContextType>({
  serviceName,
  run,
  onReceive,
  onEnd,
  endEvent,
  errEvent,
}: {
  serviceName: string;
  run: ({
    onCallback,
    event,
    context,
  }: {
    onCallback?: (ev: any) => void;
    event: any;
    context: ContextType;
  }) => any | void | Promise<any> | Promise<void>;
  onReceive: (event, invokingContext, invokingEvent) => any;
  onEnd: (event: any) => void;
  endEvent?: string;
  errEvent?: string;
}) => {
  console.log(`🚜 ${serviceName} Initialized`);
  return (invokingContext, invokingEvent) => async (callback: (ev: any) => void, receive) => {
    console.log(`⭐️ 🚜 ${serviceName}`);
    try {
      let resolveEnd = null;
      const callbackMethod = (callbackEvent) => {
        console.log(`🗒 🚜 ${serviceName} >> ${callbackEvent.type}`, callbackEvent);
        if (callbackEvent.type === (endEvent || defaultServiceEnd)) {
          console.log(`🏁 🚜 ${serviceName}`);
          resolveEnd(onEnd(callbackEvent));
        }
        return callback(callbackEvent);
      };
      const result = run({ onCallback: callbackMethod, event: invokingEvent, context: invokingContext });

      // Wait until end called
      return await new Promise((end) => {
        resolveEnd = end;

        if (isPromiseLike(result)) {
          result.then(() => end(onEnd));
        }

        receive(async (ev) => {
          console.log(`🗒 🚜 ${serviceName} << ${ev.type}`, ev);
          const waiting = onReceive(ev, invokingContext, invokingEvent);
          if (isPromiseLike(waiting)) {
            await waiting;
          }
          if (ev.type === (endEvent || defaultServiceEnd)) {
            console.log(`🏁 🚜 ${serviceName}`);
            end(onEnd(ev));
          }
        });
      });
    } catch (err) {
      callback({ type: errEvent || defaultEndEvent, err });
      // Throw so the onError is caught
      throw err;
    }
  };
};
const serviceTemplate = (c, invokingEvent) => async (callback: (ev: any) => void, onReceive) => {
  try {
    // Wait until end called
    return await new Promise((end) => {
      onReceive((ev) => {
        if (ev.type === defaultServiceEnd) {
          end(ev);
        }
      });
    });
  } catch (err) {
    callback({ type: 'ERROR', err });
  }
};
