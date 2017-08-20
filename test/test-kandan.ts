import {findMaxSumOfContiguousSubArray} from '../src/extractor'


it('should find correct indices', () => {
  var indices = findMaxSumOfContiguousSubArray([12,-1,-1,-1,12]);
  expect(indices).toMatchObject({endIndex: 4, startIndex: 4});
});

it('should find correct indices', () => {
  var indices = findMaxSumOfContiguousSubArray([]);
  expect(indices).toMatchObject({endIndex: -1, startIndex: -1});
});

it('should find correct indices', () => {
  var indices = findMaxSumOfContiguousSubArray([-14,-15,-16,-17]);
  expect(indices).toMatchObject({endIndex: -1, startIndex: -1});
});