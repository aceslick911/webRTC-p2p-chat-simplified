import { isPromiseLike } from 'xstate/lib/utils';

export const machineService = <ContextType>({
  serviceName,
  run,
  onReceive,
  onEnd,
  endEvent,
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
  }) => Promise<any> | Promise<void>;
  onReceive: (event, invokingContext, invokingEvent) => any;
  onEnd: (event: any) => void;
  endEvent?: string;
}) => {
  console.log(`🚜 ${serviceName} Initialized`);
  return (invokingContext, invokingEvent) => async (callback: (ev: any) => void, receive) => {
    console.log(`⭐️ 🚜 ${serviceName}`);
    try {
      const callbackMethod = (callbackEvent) => {
        console.log(`🗒 🚜 ${serviceName} >> ${callbackEvent.type}`, callbackEvent);
        return callback(callbackEvent);
      };
      run({ onCallback: callbackMethod, event: invokingEvent, context: invokingContext });
      // Wait until end called
      return await new Promise((end) => {
        receive(async (ev) => {
          console.log(`🗒 🚜 ${serviceName} << ${ev.type}`, ev);
          const waiting = onReceive(ev, invokingContext, invokingEvent);
          if (isPromiseLike(waiting)) {
            await waiting;
          }
          if (ev.type === (endEvent || 'SERVICE_END')) {
            console.log(`🏁 🚜 ${serviceName}`);
            end(onEnd(ev));
          }
        });
      });
    } catch (err) {
      callback({ type: 'ERROR', err });
    }
  };
};
const serviceTemplate = (c, invokingEvent) => async (callback: (ev: any) => void, onReceive) => {
  try {
    // Wait until end called
    return await new Promise((end) => {
      onReceive((ev) => {
        if (ev.type === 'SERVICE_END') {
          end(ev);
        }
      });
    });
  } catch (err) {
    callback({ type: 'ERROR', err });
  }
};
