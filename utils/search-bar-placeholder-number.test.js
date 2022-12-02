const {
  roundDownToNearestHundred,
  convertToLocalizedString
} = require('./search-bar-placeholder-number');

describe('Search bar placeholder number tests:', () => {
  describe('Number rounding', () => {
    test('Numbers less than 100 return 0', () => {
      const testArr = [0, 1, 50, 99];

      testArr.forEach(num => {
        expect(roundDownToNearestHundred(num)).toEqual(0);
      });
    });

    test('Numbers greater than 100 return a number rounded down to the nearest 100', () => {
      const testArr = [
        {
          num: 100,
          expected: 100
        },
        {
          num: 101,
          expected: 100
        },
        {
          num: 199,
          expected: 100
        },
        {
          num: 999,
          expected: 900
        },
        {
          num: 1000,
          expected: 1000
        },
        {
          num: 1001,
          expected: 1000
        },
        {
          num: 1999,
          expected: 1900
        },
        {
          num: 10000,
          expected: 10000
        },
        {
          num: 10001,
          expected: 10000
        },
        {
          num: 19999,
          expected: 19900
        }
      ];

      testArr.forEach(obj => {
        expect(roundDownToNearestHundred(obj.num)).toEqual(obj.expected);
      });
    });
  });

  describe('Number localization', () => {
    test('Numbers are localized to the correct locale', () => {
      const testArr = [
        {
          num: 100,
          locale: 'en',
          expected: '100'
        },
        {
          num: 100,
          locale: 'zh',
          expected: '100'
        },
        {
          num: 100,
          locale: 'de',
          expected: '100'
        },
        {
          num: 1000,
          locale: 'en',
          expected: '1,000'
        },
        {
          num: 1000,
          locale: 'zh',
          expected: '1,000'
        },
        {
          num: 1000,
          locale: 'de',
          expected: '1.000'
        },
        {
          num: 10000,
          locale: 'en',
          expected: '10,000'
        },
        {
          num: 10000,
          locale: 'zh',
          expected: '10,000'
        },
        {
          num: 10000,
          locale: 'de',
          expected: '10.000'
        },
        {
          num: 100000,
          locale: 'en',
          expected: '100,000'
        },
        {
          num: 100000,
          locale: 'zh',
          expected: '100,000'
        },
        {
          num: 100000,
          locale: 'de',
          expected: '100.000'
        }
      ];

      testArr.forEach(obj => {
        expect(convertToLocalizedString(obj.num, obj.locale)).toEqual(
          obj.expected
        );
      });
    });
  });
});
