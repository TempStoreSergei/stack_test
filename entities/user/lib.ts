export const debounce = (func: Function, delay: number) => {
    let timerId: number;
    return (...args: any[]) => {
        clearTimeout(timerId);
        timerId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}