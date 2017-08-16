import {findMaxSumOfContiguousSubArray} from '../src/extractor'


it('should find correct indices', () => {
  var indices = findMaxSumOfContiguousSubArray([12,-1,-1,-1,12]);
  expect(indices).toMatchObject({endIndex: 4, startIndex: 4});
});





