/**
 * Thinking different does not always work better...
 */

const force = true;
const isIOS = (/iPad|iPhone|iPod/.test(navigator.platform) ||
(navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) &&
!window.MSStream;

const ACTIVE_EVENTS = new WeakMap();
const ACTIVE_TOUCHES = new WeakMap();
const ACTIVE_MOMENTUM = new WeakMap();

function handleTouchStart(event) {
    const target = event.currentTarget;
    const touch = event.changedTouches[0];
    if (ACTIVE_MOMENTUM.has(target)) {
        ACTIVE_MOMENTUM.delete(target);
    } else {
        if (!ACTIVE_EVENTS.has(target)) {
            const timeout = setTimeout(() => {
                if (ACTIVE_EVENTS.has(target)) {
                    ACTIVE_EVENTS.delete(target);
                    if (ACTIVE_TOUCHES.has(target)) {
                        ACTIVE_TOUCHES.delete(target);
                    }
                    if (ACTIVE_MOMENTUM.has(target)) {
                        ACTIVE_MOMENTUM.delete(target);
                    }
                    /*if (navigator.vibrate != null) {
                        navigator.vibrate(100);
                    }*/
                    const nEvent = new Event("contextmenu");
                    nEvent.clientX = touch.clientX;
                    nEvent.clientY = touch.clientY;
                    target.dispatchEvent(nEvent);
                }
            }, 500);
            ACTIVE_EVENTS.set(target, timeout);
        }
        if (!ACTIVE_TOUCHES.has(target)) {
            ACTIVE_TOUCHES.set(target, {
                x: touch.clientX,
                y: touch.clientY
            });
        }
    }
    event.preventDefault();
    return false;
}

function handleTouchMove(event) {
    const target = event.currentTarget;
    const touch = event.changedTouches[0];
    if (ACTIVE_EVENTS.has(target)) {
        const timeout = ACTIVE_EVENTS.get(target);
        ACTIVE_EVENTS.delete(target);
        clearInterval(timeout);
    }
    if (ACTIVE_TOUCHES.has(target)) {
        const momentum = {x: 0, y: 0};
        const active = ACTIVE_TOUCHES.get(target);
        if (target.scrollWidth > target.clientWidth) {
            momentum.x = active.x - touch.clientX;
            target.scrollLeft += momentum.x;
        }
        if (target.scrollHeight > target.clientHeight) {
            momentum.y = active.y - touch.clientY;
            target.scrollTop += momentum.y;
        }
        ACTIVE_TOUCHES.set(target, {
            x: touch.clientX,
            y: touch.clientY
        });
        ACTIVE_MOMENTUM.set(target, momentum);
    }
    event.preventDefault();
    return false;
}

function handleTouchCancle(event) {
    const target = event.currentTarget;
    if (ACTIVE_EVENTS.has(target)) {
        const timeout = ACTIVE_EVENTS.get(target);
        clearInterval(timeout);
        ACTIVE_EVENTS.delete(target);
    }
    if (ACTIVE_TOUCHES.has(target)) {
        ACTIVE_TOUCHES.delete(target);
    }
    if (ACTIVE_MOMENTUM.has(target)) {
        ACTIVE_MOMENTUM.delete(target);
    }
    event.preventDefault();
    return false;
}

function handleTouchEnd(event) {
    const target = event.currentTarget;
    if (ACTIVE_EVENTS.has(target)) {
        const timeout = ACTIVE_EVENTS.get(target);
        clearInterval(timeout);
        ACTIVE_EVENTS.delete(target);
        if (ACTIVE_TOUCHES.has(target)) {
            const active = ACTIVE_TOUCHES.get(target);
            const nEvent = new Event("click");
            nEvent.clientX = active.x;
            nEvent.clientY = active.y;
            target.dispatchEvent(nEvent);
        }
    }
    if (ACTIVE_TOUCHES.has(target)) {
        ACTIVE_TOUCHES.delete(target);
    }
    if (ACTIVE_MOMENTUM.has(target)) {
        requestAnimationFrame(() => {
            handleMomentum(target);
        });
    }
    event.preventDefault();
    return false;
}

function handleMomentum(target) {
    if (ACTIVE_MOMENTUM.has(target)) {
        const momentum = ACTIVE_MOMENTUM.get(target);
        if (target.scrollWidth > target.clientWidth) {
            momentum.x = parseInt(momentum.x * 0.99);
            target.scrollLeft += momentum.x;
        }
        if (target.scrollHeight > target.clientHeight) {
            momentum.y = parseInt(momentum.y * 0.99);
            target.scrollTop += momentum.y;
        }
        if (momentum.x == 0 && momentum.y == 0) {
            ACTIVE_MOMENTUM.delete(target);
        } else {
            requestAnimationFrame(() => {
                handleMomentum(target);
            });
        }
    }
}

class iOSTouchHandler {

    register(element, stopPropagation = false) {
        if (!(element instanceof HTMLElement)) {
            throw new TypeError("element must be of type HTMLElement");
        }
        if (force || isIOS) {
            element.addEventListener("touchstart", event => {
                handleTouchStart(event);
                if (stopPropagation) {
                    event.stopPropagation();
                }
            });
            element.addEventListener("touchmove", event => {
                handleTouchMove(event);
                if (stopPropagation) {
                    event.stopPropagation();
                }
            });
            element.addEventListener("touchcancle", event => {
                handleTouchCancle(event);
                if (stopPropagation) {
                    event.stopPropagation();
                }
            });
            element.addEventListener("touchend", event => {
                handleTouchEnd(event);
                if (stopPropagation) {
                    event.stopPropagation();
                }
            });
        }
    }

}

export default new iOSTouchHandler();
