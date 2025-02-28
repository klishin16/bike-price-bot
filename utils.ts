export function splitIntoPairs<T>(arr: T[]) {
    return arr.reduce<T[][]>((acc, _, i, src) => {
        if (i % 2 === 0) acc.push(src.slice(i, i + 2));
        return acc;
    }, []);
}
