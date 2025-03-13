import { describe, test, expect } from "vitest";
import { join } from "./utils";

describe('Typing - join fn', () => {

    test('a b', () => {
        const result = join(['a', 'b'])
        expect(result).toEqual('a and b')
    })

    test('a b c', () => {
        expect(join(['a', 'b', 'c'])).toEqual('a, b and c')
    })

    test('a b c d', () => {
        expect(join(['a', 'b', 'c', 'd'])).toEqual('a, b, c and d')
    })
})