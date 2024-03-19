// animation params
const localData = {
  timestamp: 0,
  timeDiff: 0,
  frame: null,
};
const localFrameOpts = {
  data: localData,
};

const frameEvent = new MessageEvent("tick", localFrameOpts);

class TickManager extends EventTarget {
  timestamp: any;
  timeDiff: any;
  frame: any;
  constructor({ timestamp, timeDiff, frame } = localData) {
    super();

    this.timestamp = timestamp;
    this.timeDiff = timeDiff;
    this.frame = frame;
  }
  startLoop() {
    let lastTimestamp = performance.now();
  }
  tick(timestamp: any, timeDiff: any, frame: any) {
    localData.timestamp = timestamp;
    localData.frame = frame;
    localData.timeDiff = timeDiff;
    this.dispatchEvent(frameEvent);
  }
}

export default TickManager;
