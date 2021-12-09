namespace TM007 {
  const Dec0 = "0";
  const Dec1 = "1";
  const Dec2 = "2";
  const Dec3 = "3";
  const Dec4 = "4";
  const Dec5 = "5";
  const Dec6 = "6";
  const Dec7 = "7";
  const Dec8 = "8";
  const Dec9 = "9";

  type Dec0 = typeof Dec0;
  type Dec1 = typeof Dec1;
  type Dec2 = typeof Dec2;
  type Dec3 = typeof Dec3;
  type Dec4 = typeof Dec4;
  type Dec5 = typeof Dec5;
  type Dec6 = typeof Dec6;
  type Dec7 = typeof Dec7;
  type Dec8 = typeof Dec8;
  type Dec9 = typeof Dec9;

  type Dec =
    | Dec0
    | Dec1
    | Dec2
    | Dec3
    | Dec4
    | Dec5
    | Dec6
    | Dec7
    | Dec8
    | Dec9;

  type AddDecTable = {
    [Dec0]: {
      [Dec0]: {
        [Dec0]: [Dec0, Dec0];
        [Dec1]: [Dec1, Dec0];
        [Dec2]: [Dec2, Dec0];
        [Dec3]: [Dec3, Dec0];
        [Dec4]: [Dec4, Dec0];
        [Dec5]: [Dec5, Dec0];
        [Dec6]: [Dec6, Dec0];
        [Dec7]: [Dec7, Dec0];
        [Dec8]: [Dec8, Dec0];
        [Dec9]: [Dec9, Dec0];
      };
      [Dec1]: {
        [Dec0]: [Dec1, Dec0];
        [Dec1]: [Dec2, Dec0];
        [Dec2]: [Dec3, Dec0];
        [Dec3]: [Dec4, Dec0];
        [Dec4]: [Dec5, Dec0];
        [Dec5]: [Dec6, Dec0];
        [Dec6]: [Dec7, Dec0];
        [Dec7]: [Dec8, Dec0];
        [Dec8]: [Dec9, Dec0];
        [Dec9]: [Dec0, Dec1];
      };
      [Dec2]: {
        [Dec0]: [Dec2, Dec0];
        [Dec1]: [Dec3, Dec0];
        [Dec2]: [Dec4, Dec0];
        [Dec3]: [Dec5, Dec0];
        [Dec4]: [Dec6, Dec0];
        [Dec5]: [Dec7, Dec0];
        [Dec6]: [Dec8, Dec0];
        [Dec7]: [Dec9, Dec0];
        [Dec8]: [Dec0, Dec1];
        [Dec9]: [Dec1, Dec1];
      };
      [Dec3]: {
        [Dec0]: [Dec3, Dec0];
        [Dec1]: [Dec4, Dec0];
        [Dec2]: [Dec5, Dec0];
        [Dec3]: [Dec6, Dec0];
        [Dec4]: [Dec7, Dec0];
        [Dec5]: [Dec8, Dec0];
        [Dec6]: [Dec9, Dec0];
        [Dec7]: [Dec0, Dec1];
        [Dec8]: [Dec1, Dec1];
        [Dec9]: [Dec2, Dec1];
      };
      [Dec4]: {
        [Dec0]: [Dec4, Dec0];
        [Dec1]: [Dec5, Dec0];
        [Dec2]: [Dec6, Dec0];
        [Dec3]: [Dec7, Dec0];
        [Dec4]: [Dec8, Dec0];
        [Dec5]: [Dec9, Dec0];
        [Dec6]: [Dec0, Dec1];
        [Dec7]: [Dec1, Dec1];
        [Dec8]: [Dec2, Dec1];
        [Dec9]: [Dec3, Dec1];
      };
      [Dec5]: {
        [Dec0]: [Dec5, Dec0];
        [Dec1]: [Dec6, Dec0];
        [Dec2]: [Dec7, Dec0];
        [Dec3]: [Dec8, Dec0];
        [Dec4]: [Dec9, Dec0];
        [Dec5]: [Dec0, Dec1];
        [Dec6]: [Dec1, Dec1];
        [Dec7]: [Dec2, Dec1];
        [Dec8]: [Dec3, Dec1];
        [Dec9]: [Dec4, Dec1];
      };
      [Dec6]: {
        [Dec0]: [Dec6, Dec0];
        [Dec1]: [Dec7, Dec0];
        [Dec2]: [Dec8, Dec0];
        [Dec3]: [Dec9, Dec0];
        [Dec4]: [Dec0, Dec1];
        [Dec5]: [Dec1, Dec1];
        [Dec6]: [Dec2, Dec1];
        [Dec7]: [Dec3, Dec1];
        [Dec8]: [Dec4, Dec1];
        [Dec9]: [Dec5, Dec1];
      };
      [Dec7]: {
        [Dec0]: [Dec7, Dec0];
        [Dec1]: [Dec8, Dec0];
        [Dec2]: [Dec9, Dec0];
        [Dec3]: [Dec0, Dec1];
        [Dec4]: [Dec1, Dec1];
        [Dec5]: [Dec2, Dec1];
        [Dec6]: [Dec3, Dec1];
        [Dec7]: [Dec4, Dec1];
        [Dec8]: [Dec5, Dec1];
        [Dec9]: [Dec6, Dec1];
      };
      [Dec8]: {
        [Dec0]: [Dec8, Dec0];
        [Dec1]: [Dec9, Dec0];
        [Dec2]: [Dec0, Dec1];
        [Dec3]: [Dec1, Dec1];
        [Dec4]: [Dec2, Dec1];
        [Dec5]: [Dec3, Dec1];
        [Dec6]: [Dec4, Dec1];
        [Dec7]: [Dec5, Dec1];
        [Dec8]: [Dec6, Dec1];
        [Dec9]: [Dec7, Dec1];
      };
      [Dec9]: {
        [Dec0]: [Dec9, Dec0];
        [Dec1]: [Dec0, Dec1];
        [Dec2]: [Dec1, Dec1];
        [Dec3]: [Dec2, Dec1];
        [Dec4]: [Dec3, Dec1];
        [Dec5]: [Dec4, Dec1];
        [Dec6]: [Dec5, Dec1];
        [Dec7]: [Dec6, Dec1];
        [Dec8]: [Dec7, Dec1];
        [Dec9]: [Dec8, Dec1];
      };
    };
    [Dec1]: {
      [Dec0]: {
        [Dec0]: [Dec1, Dec0];
        [Dec1]: [Dec2, Dec0];
        [Dec2]: [Dec3, Dec0];
        [Dec3]: [Dec4, Dec0];
        [Dec4]: [Dec5, Dec0];
        [Dec5]: [Dec6, Dec0];
        [Dec6]: [Dec7, Dec0];
        [Dec7]: [Dec8, Dec0];
        [Dec8]: [Dec9, Dec0];
        [Dec9]: [Dec0, Dec1];
      };
      [Dec1]: {
        [Dec0]: [Dec2, Dec0];
        [Dec1]: [Dec3, Dec0];
        [Dec2]: [Dec4, Dec0];
        [Dec3]: [Dec5, Dec0];
        [Dec4]: [Dec6, Dec0];
        [Dec5]: [Dec7, Dec0];
        [Dec6]: [Dec8, Dec0];
        [Dec7]: [Dec9, Dec0];
        [Dec8]: [Dec0, Dec1];
        [Dec9]: [Dec1, Dec1];
      };
      [Dec2]: {
        [Dec0]: [Dec3, Dec0];
        [Dec1]: [Dec4, Dec0];
        [Dec2]: [Dec5, Dec0];
        [Dec3]: [Dec6, Dec0];
        [Dec4]: [Dec7, Dec0];
        [Dec5]: [Dec8, Dec0];
        [Dec6]: [Dec9, Dec0];
        [Dec7]: [Dec0, Dec1];
        [Dec8]: [Dec1, Dec1];
        [Dec9]: [Dec2, Dec1];
      };
      [Dec3]: {
        [Dec0]: [Dec4, Dec0];
        [Dec1]: [Dec5, Dec0];
        [Dec2]: [Dec6, Dec0];
        [Dec3]: [Dec7, Dec0];
        [Dec4]: [Dec8, Dec0];
        [Dec5]: [Dec9, Dec0];
        [Dec6]: [Dec0, Dec1];
        [Dec7]: [Dec1, Dec1];
        [Dec8]: [Dec2, Dec1];
        [Dec9]: [Dec3, Dec1];
      };
      [Dec4]: {
        [Dec0]: [Dec5, Dec0];
        [Dec1]: [Dec6, Dec0];
        [Dec2]: [Dec7, Dec0];
        [Dec3]: [Dec8, Dec0];
        [Dec4]: [Dec9, Dec0];
        [Dec5]: [Dec0, Dec1];
        [Dec6]: [Dec1, Dec1];
        [Dec7]: [Dec2, Dec1];
        [Dec8]: [Dec3, Dec1];
        [Dec9]: [Dec4, Dec1];
      };
      [Dec5]: {
        [Dec0]: [Dec6, Dec0];
        [Dec1]: [Dec7, Dec0];
        [Dec2]: [Dec8, Dec0];
        [Dec3]: [Dec9, Dec0];
        [Dec4]: [Dec0, Dec1];
        [Dec5]: [Dec1, Dec1];
        [Dec6]: [Dec2, Dec1];
        [Dec7]: [Dec3, Dec1];
        [Dec8]: [Dec4, Dec1];
        [Dec9]: [Dec5, Dec1];
      };
      [Dec6]: {
        [Dec0]: [Dec7, Dec0];
        [Dec1]: [Dec8, Dec0];
        [Dec2]: [Dec9, Dec0];
        [Dec3]: [Dec0, Dec1];
        [Dec4]: [Dec1, Dec1];
        [Dec5]: [Dec2, Dec1];
        [Dec6]: [Dec3, Dec1];
        [Dec7]: [Dec4, Dec1];
        [Dec8]: [Dec5, Dec1];
        [Dec9]: [Dec6, Dec1];
      };
      [Dec7]: {
        [Dec0]: [Dec8, Dec0];
        [Dec1]: [Dec9, Dec0];
        [Dec2]: [Dec0, Dec1];
        [Dec3]: [Dec1, Dec1];
        [Dec4]: [Dec2, Dec1];
        [Dec5]: [Dec3, Dec1];
        [Dec6]: [Dec4, Dec1];
        [Dec7]: [Dec5, Dec1];
        [Dec8]: [Dec6, Dec1];
        [Dec9]: [Dec7, Dec1];
      };
      [Dec8]: {
        [Dec0]: [Dec9, Dec0];
        [Dec1]: [Dec0, Dec1];
        [Dec2]: [Dec1, Dec1];
        [Dec3]: [Dec2, Dec1];
        [Dec4]: [Dec3, Dec1];
        [Dec5]: [Dec4, Dec1];
        [Dec6]: [Dec5, Dec1];
        [Dec7]: [Dec6, Dec1];
        [Dec8]: [Dec7, Dec1];
        [Dec9]: [Dec8, Dec1];
      };
      [Dec9]: {
        [Dec0]: [Dec0, Dec1];
        [Dec1]: [Dec1, Dec1];
        [Dec2]: [Dec2, Dec1];
        [Dec3]: [Dec3, Dec1];
        [Dec4]: [Dec4, Dec1];
        [Dec5]: [Dec5, Dec1];
        [Dec6]: [Dec6, Dec1];
        [Dec7]: [Dec7, Dec1];
        [Dec8]: [Dec8, Dec1];
        [Dec9]: [Dec9, Dec1];
      };
    };
    [Dec2]: {
      [Dec0]: {
        [Dec0]: [Dec2, Dec0];
        [Dec1]: [Dec3, Dec0];
        [Dec2]: [Dec4, Dec0];
        [Dec3]: [Dec5, Dec0];
        [Dec4]: [Dec6, Dec0];
        [Dec5]: [Dec7, Dec0];
        [Dec6]: [Dec8, Dec0];
        [Dec7]: [Dec9, Dec0];
        [Dec8]: [Dec0, Dec1];
        [Dec9]: [Dec1, Dec1];
      };
      [Dec1]: {
        [Dec0]: [Dec3, Dec0];
        [Dec1]: [Dec4, Dec0];
        [Dec2]: [Dec5, Dec0];
        [Dec3]: [Dec6, Dec0];
        [Dec4]: [Dec7, Dec0];
        [Dec5]: [Dec8, Dec0];
        [Dec6]: [Dec9, Dec0];
        [Dec7]: [Dec0, Dec1];
        [Dec8]: [Dec1, Dec1];
        [Dec9]: [Dec2, Dec1];
      };
      [Dec2]: {
        [Dec0]: [Dec4, Dec0];
        [Dec1]: [Dec5, Dec0];
        [Dec2]: [Dec6, Dec0];
        [Dec3]: [Dec7, Dec0];
        [Dec4]: [Dec8, Dec0];
        [Dec5]: [Dec9, Dec0];
        [Dec6]: [Dec0, Dec1];
        [Dec7]: [Dec1, Dec1];
        [Dec8]: [Dec2, Dec1];
        [Dec9]: [Dec3, Dec1];
      };
      [Dec3]: {
        [Dec0]: [Dec5, Dec0];
        [Dec1]: [Dec6, Dec0];
        [Dec2]: [Dec7, Dec0];
        [Dec3]: [Dec8, Dec0];
        [Dec4]: [Dec9, Dec0];
        [Dec5]: [Dec0, Dec1];
        [Dec6]: [Dec1, Dec1];
        [Dec7]: [Dec2, Dec1];
        [Dec8]: [Dec3, Dec1];
        [Dec9]: [Dec4, Dec1];
      };
      [Dec4]: {
        [Dec0]: [Dec6, Dec0];
        [Dec1]: [Dec7, Dec0];
        [Dec2]: [Dec8, Dec0];
        [Dec3]: [Dec9, Dec0];
        [Dec4]: [Dec0, Dec1];
        [Dec5]: [Dec1, Dec1];
        [Dec6]: [Dec2, Dec1];
        [Dec7]: [Dec3, Dec1];
        [Dec8]: [Dec4, Dec1];
        [Dec9]: [Dec5, Dec1];
      };
      [Dec5]: {
        [Dec0]: [Dec7, Dec0];
        [Dec1]: [Dec8, Dec0];
        [Dec2]: [Dec9, Dec0];
        [Dec3]: [Dec0, Dec1];
        [Dec4]: [Dec1, Dec1];
        [Dec5]: [Dec2, Dec1];
        [Dec6]: [Dec3, Dec1];
        [Dec7]: [Dec4, Dec1];
        [Dec8]: [Dec5, Dec1];
        [Dec9]: [Dec6, Dec1];
      };
      [Dec6]: {
        [Dec0]: [Dec8, Dec0];
        [Dec1]: [Dec9, Dec0];
        [Dec2]: [Dec0, Dec1];
        [Dec3]: [Dec1, Dec1];
        [Dec4]: [Dec2, Dec1];
        [Dec5]: [Dec3, Dec1];
        [Dec6]: [Dec4, Dec1];
        [Dec7]: [Dec5, Dec1];
        [Dec8]: [Dec6, Dec1];
        [Dec9]: [Dec7, Dec1];
      };
      [Dec7]: {
        [Dec0]: [Dec9, Dec0];
        [Dec1]: [Dec0, Dec1];
        [Dec2]: [Dec1, Dec1];
        [Dec3]: [Dec2, Dec1];
        [Dec4]: [Dec3, Dec1];
        [Dec5]: [Dec4, Dec1];
        [Dec6]: [Dec5, Dec1];
        [Dec7]: [Dec6, Dec1];
        [Dec8]: [Dec7, Dec1];
        [Dec9]: [Dec8, Dec1];
      };
      [Dec8]: {
        [Dec0]: [Dec0, Dec1];
        [Dec1]: [Dec1, Dec1];
        [Dec2]: [Dec2, Dec1];
        [Dec3]: [Dec3, Dec1];
        [Dec4]: [Dec4, Dec1];
        [Dec5]: [Dec5, Dec1];
        [Dec6]: [Dec6, Dec1];
        [Dec7]: [Dec7, Dec1];
        [Dec8]: [Dec8, Dec1];
        [Dec9]: [Dec9, Dec1];
      };
      [Dec9]: {
        [Dec0]: [Dec1, Dec1];
        [Dec1]: [Dec2, Dec1];
        [Dec2]: [Dec3, Dec1];
        [Dec3]: [Dec4, Dec1];
        [Dec4]: [Dec5, Dec1];
        [Dec5]: [Dec6, Dec1];
        [Dec6]: [Dec7, Dec1];
        [Dec7]: [Dec8, Dec1];
        [Dec8]: [Dec9, Dec1];
        [Dec9]: [Dec0, Dec2];
      };
    };
    [Dec3]: {
      [Dec0]: {
        [Dec0]: [Dec3, Dec0];
        [Dec1]: [Dec4, Dec0];
        [Dec2]: [Dec5, Dec0];
        [Dec3]: [Dec6, Dec0];
        [Dec4]: [Dec7, Dec0];
        [Dec5]: [Dec8, Dec0];
        [Dec6]: [Dec9, Dec0];
        [Dec7]: [Dec0, Dec1];
        [Dec8]: [Dec1, Dec1];
        [Dec9]: [Dec2, Dec1];
      };
      [Dec1]: {
        [Dec0]: [Dec4, Dec0];
        [Dec1]: [Dec5, Dec0];
        [Dec2]: [Dec6, Dec0];
        [Dec3]: [Dec7, Dec0];
        [Dec4]: [Dec8, Dec0];
        [Dec5]: [Dec9, Dec0];
        [Dec6]: [Dec0, Dec1];
        [Dec7]: [Dec1, Dec1];
        [Dec8]: [Dec2, Dec1];
        [Dec9]: [Dec3, Dec1];
      };
      [Dec2]: {
        [Dec0]: [Dec5, Dec0];
        [Dec1]: [Dec6, Dec0];
        [Dec2]: [Dec7, Dec0];
        [Dec3]: [Dec8, Dec0];
        [Dec4]: [Dec9, Dec0];
        [Dec5]: [Dec0, Dec1];
        [Dec6]: [Dec1, Dec1];
        [Dec7]: [Dec2, Dec1];
        [Dec8]: [Dec3, Dec1];
        [Dec9]: [Dec4, Dec1];
      };
      [Dec3]: {
        [Dec0]: [Dec6, Dec0];
        [Dec1]: [Dec7, Dec0];
        [Dec2]: [Dec8, Dec0];
        [Dec3]: [Dec9, Dec0];
        [Dec4]: [Dec0, Dec1];
        [Dec5]: [Dec1, Dec1];
        [Dec6]: [Dec2, Dec1];
        [Dec7]: [Dec3, Dec1];
        [Dec8]: [Dec4, Dec1];
        [Dec9]: [Dec5, Dec1];
      };
      [Dec4]: {
        [Dec0]: [Dec7, Dec0];
        [Dec1]: [Dec8, Dec0];
        [Dec2]: [Dec9, Dec0];
        [Dec3]: [Dec0, Dec1];
        [Dec4]: [Dec1, Dec1];
        [Dec5]: [Dec2, Dec1];
        [Dec6]: [Dec3, Dec1];
        [Dec7]: [Dec4, Dec1];
        [Dec8]: [Dec5, Dec1];
        [Dec9]: [Dec6, Dec1];
      };
      [Dec5]: {
        [Dec0]: [Dec8, Dec0];
        [Dec1]: [Dec9, Dec0];
        [Dec2]: [Dec0, Dec1];
        [Dec3]: [Dec1, Dec1];
        [Dec4]: [Dec2, Dec1];
        [Dec5]: [Dec3, Dec1];
        [Dec6]: [Dec4, Dec1];
        [Dec7]: [Dec5, Dec1];
        [Dec8]: [Dec6, Dec1];
        [Dec9]: [Dec7, Dec1];
      };
      [Dec6]: {
        [Dec0]: [Dec9, Dec0];
        [Dec1]: [Dec0, Dec1];
        [Dec2]: [Dec1, Dec1];
        [Dec3]: [Dec2, Dec1];
        [Dec4]: [Dec3, Dec1];
        [Dec5]: [Dec4, Dec1];
        [Dec6]: [Dec5, Dec1];
        [Dec7]: [Dec6, Dec1];
        [Dec8]: [Dec7, Dec1];
        [Dec9]: [Dec8, Dec1];
      };
      [Dec7]: {
        [Dec0]: [Dec0, Dec1];
        [Dec1]: [Dec1, Dec1];
        [Dec2]: [Dec2, Dec1];
        [Dec3]: [Dec3, Dec1];
        [Dec4]: [Dec4, Dec1];
        [Dec5]: [Dec5, Dec1];
        [Dec6]: [Dec6, Dec1];
        [Dec7]: [Dec7, Dec1];
        [Dec8]: [Dec8, Dec1];
        [Dec9]: [Dec9, Dec1];
      };
      [Dec8]: {
        [Dec0]: [Dec1, Dec1];
        [Dec1]: [Dec2, Dec1];
        [Dec2]: [Dec3, Dec1];
        [Dec3]: [Dec4, Dec1];
        [Dec4]: [Dec5, Dec1];
        [Dec5]: [Dec6, Dec1];
        [Dec6]: [Dec7, Dec1];
        [Dec7]: [Dec8, Dec1];
        [Dec8]: [Dec9, Dec1];
        [Dec9]: [Dec0, Dec2];
      };
      [Dec9]: {
        [Dec0]: [Dec2, Dec1];
        [Dec1]: [Dec3, Dec1];
        [Dec2]: [Dec4, Dec1];
        [Dec3]: [Dec5, Dec1];
        [Dec4]: [Dec6, Dec1];
        [Dec5]: [Dec7, Dec1];
        [Dec6]: [Dec8, Dec1];
        [Dec7]: [Dec9, Dec1];
        [Dec8]: [Dec0, Dec2];
        [Dec9]: [Dec1, Dec2];
      };
    };
    [Dec4]: {
      [Dec0]: {
        [Dec0]: [Dec4, Dec0];
        [Dec1]: [Dec5, Dec0];
        [Dec2]: [Dec6, Dec0];
        [Dec3]: [Dec7, Dec0];
        [Dec4]: [Dec8, Dec0];
        [Dec5]: [Dec9, Dec0];
        [Dec6]: [Dec0, Dec1];
        [Dec7]: [Dec1, Dec1];
        [Dec8]: [Dec2, Dec1];
        [Dec9]: [Dec3, Dec1];
      };
      [Dec1]: {
        [Dec0]: [Dec5, Dec0];
        [Dec1]: [Dec6, Dec0];
        [Dec2]: [Dec7, Dec0];
        [Dec3]: [Dec8, Dec0];
        [Dec4]: [Dec9, Dec0];
        [Dec5]: [Dec0, Dec1];
        [Dec6]: [Dec1, Dec1];
        [Dec7]: [Dec2, Dec1];
        [Dec8]: [Dec3, Dec1];
        [Dec9]: [Dec4, Dec1];
      };
      [Dec2]: {
        [Dec0]: [Dec6, Dec0];
        [Dec1]: [Dec7, Dec0];
        [Dec2]: [Dec8, Dec0];
        [Dec3]: [Dec9, Dec0];
        [Dec4]: [Dec0, Dec1];
        [Dec5]: [Dec1, Dec1];
        [Dec6]: [Dec2, Dec1];
        [Dec7]: [Dec3, Dec1];
        [Dec8]: [Dec4, Dec1];
        [Dec9]: [Dec5, Dec1];
      };
      [Dec3]: {
        [Dec0]: [Dec7, Dec0];
        [Dec1]: [Dec8, Dec0];
        [Dec2]: [Dec9, Dec0];
        [Dec3]: [Dec0, Dec1];
        [Dec4]: [Dec1, Dec1];
        [Dec5]: [Dec2, Dec1];
        [Dec6]: [Dec3, Dec1];
        [Dec7]: [Dec4, Dec1];
        [Dec8]: [Dec5, Dec1];
        [Dec9]: [Dec6, Dec1];
      };
      [Dec4]: {
        [Dec0]: [Dec8, Dec0];
        [Dec1]: [Dec9, Dec0];
        [Dec2]: [Dec0, Dec1];
        [Dec3]: [Dec1, Dec1];
        [Dec4]: [Dec2, Dec1];
        [Dec5]: [Dec3, Dec1];
        [Dec6]: [Dec4, Dec1];
        [Dec7]: [Dec5, Dec1];
        [Dec8]: [Dec6, Dec1];
        [Dec9]: [Dec7, Dec1];
      };
      [Dec5]: {
        [Dec0]: [Dec9, Dec0];
        [Dec1]: [Dec0, Dec1];
        [Dec2]: [Dec1, Dec1];
        [Dec3]: [Dec2, Dec1];
        [Dec4]: [Dec3, Dec1];
        [Dec5]: [Dec4, Dec1];
        [Dec6]: [Dec5, Dec1];
        [Dec7]: [Dec6, Dec1];
        [Dec8]: [Dec7, Dec1];
        [Dec9]: [Dec8, Dec1];
      };
      [Dec6]: {
        [Dec0]: [Dec0, Dec1];
        [Dec1]: [Dec1, Dec1];
        [Dec2]: [Dec2, Dec1];
        [Dec3]: [Dec3, Dec1];
        [Dec4]: [Dec4, Dec1];
        [Dec5]: [Dec5, Dec1];
        [Dec6]: [Dec6, Dec1];
        [Dec7]: [Dec7, Dec1];
        [Dec8]: [Dec8, Dec1];
        [Dec9]: [Dec9, Dec1];
      };
      [Dec7]: {
        [Dec0]: [Dec1, Dec1];
        [Dec1]: [Dec2, Dec1];
        [Dec2]: [Dec3, Dec1];
        [Dec3]: [Dec4, Dec1];
        [Dec4]: [Dec5, Dec1];
        [Dec5]: [Dec6, Dec1];
        [Dec6]: [Dec7, Dec1];
        [Dec7]: [Dec8, Dec1];
        [Dec8]: [Dec9, Dec1];
        [Dec9]: [Dec0, Dec2];
      };
      [Dec8]: {
        [Dec0]: [Dec2, Dec1];
        [Dec1]: [Dec3, Dec1];
        [Dec2]: [Dec4, Dec1];
        [Dec3]: [Dec5, Dec1];
        [Dec4]: [Dec6, Dec1];
        [Dec5]: [Dec7, Dec1];
        [Dec6]: [Dec8, Dec1];
        [Dec7]: [Dec9, Dec1];
        [Dec8]: [Dec0, Dec2];
        [Dec9]: [Dec1, Dec2];
      };
      [Dec9]: {
        [Dec0]: [Dec3, Dec1];
        [Dec1]: [Dec4, Dec1];
        [Dec2]: [Dec5, Dec1];
        [Dec3]: [Dec6, Dec1];
        [Dec4]: [Dec7, Dec1];
        [Dec5]: [Dec8, Dec1];
        [Dec6]: [Dec9, Dec1];
        [Dec7]: [Dec0, Dec2];
        [Dec8]: [Dec1, Dec2];
        [Dec9]: [Dec2, Dec2];
      };
    };
    [Dec5]: {
      [Dec0]: {
        [Dec0]: [Dec5, Dec0];
        [Dec1]: [Dec6, Dec0];
        [Dec2]: [Dec7, Dec0];
        [Dec3]: [Dec8, Dec0];
        [Dec4]: [Dec9, Dec0];
        [Dec5]: [Dec0, Dec1];
        [Dec6]: [Dec1, Dec1];
        [Dec7]: [Dec2, Dec1];
        [Dec8]: [Dec3, Dec1];
        [Dec9]: [Dec4, Dec1];
      };
      [Dec1]: {
        [Dec0]: [Dec6, Dec0];
        [Dec1]: [Dec7, Dec0];
        [Dec2]: [Dec8, Dec0];
        [Dec3]: [Dec9, Dec0];
        [Dec4]: [Dec0, Dec1];
        [Dec5]: [Dec1, Dec1];
        [Dec6]: [Dec2, Dec1];
        [Dec7]: [Dec3, Dec1];
        [Dec8]: [Dec4, Dec1];
        [Dec9]: [Dec5, Dec1];
      };
      [Dec2]: {
        [Dec0]: [Dec7, Dec0];
        [Dec1]: [Dec8, Dec0];
        [Dec2]: [Dec9, Dec0];
        [Dec3]: [Dec0, Dec1];
        [Dec4]: [Dec1, Dec1];
        [Dec5]: [Dec2, Dec1];
        [Dec6]: [Dec3, Dec1];
        [Dec7]: [Dec4, Dec1];
        [Dec8]: [Dec5, Dec1];
        [Dec9]: [Dec6, Dec1];
      };
      [Dec3]: {
        [Dec0]: [Dec8, Dec0];
        [Dec1]: [Dec9, Dec0];
        [Dec2]: [Dec0, Dec1];
        [Dec3]: [Dec1, Dec1];
        [Dec4]: [Dec2, Dec1];
        [Dec5]: [Dec3, Dec1];
        [Dec6]: [Dec4, Dec1];
        [Dec7]: [Dec5, Dec1];
        [Dec8]: [Dec6, Dec1];
        [Dec9]: [Dec7, Dec1];
      };
      [Dec4]: {
        [Dec0]: [Dec9, Dec0];
        [Dec1]: [Dec0, Dec1];
        [Dec2]: [Dec1, Dec1];
        [Dec3]: [Dec2, Dec1];
        [Dec4]: [Dec3, Dec1];
        [Dec5]: [Dec4, Dec1];
        [Dec6]: [Dec5, Dec1];
        [Dec7]: [Dec6, Dec1];
        [Dec8]: [Dec7, Dec1];
        [Dec9]: [Dec8, Dec1];
      };
      [Dec5]: {
        [Dec0]: [Dec0, Dec1];
        [Dec1]: [Dec1, Dec1];
        [Dec2]: [Dec2, Dec1];
        [Dec3]: [Dec3, Dec1];
        [Dec4]: [Dec4, Dec1];
        [Dec5]: [Dec5, Dec1];
        [Dec6]: [Dec6, Dec1];
        [Dec7]: [Dec7, Dec1];
        [Dec8]: [Dec8, Dec1];
        [Dec9]: [Dec9, Dec1];
      };
      [Dec6]: {
        [Dec0]: [Dec1, Dec1];
        [Dec1]: [Dec2, Dec1];
        [Dec2]: [Dec3, Dec1];
        [Dec3]: [Dec4, Dec1];
        [Dec4]: [Dec5, Dec1];
        [Dec5]: [Dec6, Dec1];
        [Dec6]: [Dec7, Dec1];
        [Dec7]: [Dec8, Dec1];
        [Dec8]: [Dec9, Dec1];
        [Dec9]: [Dec0, Dec2];
      };
      [Dec7]: {
        [Dec0]: [Dec2, Dec1];
        [Dec1]: [Dec3, Dec1];
        [Dec2]: [Dec4, Dec1];
        [Dec3]: [Dec5, Dec1];
        [Dec4]: [Dec6, Dec1];
        [Dec5]: [Dec7, Dec1];
        [Dec6]: [Dec8, Dec1];
        [Dec7]: [Dec9, Dec1];
        [Dec8]: [Dec0, Dec2];
        [Dec9]: [Dec1, Dec2];
      };
      [Dec8]: {
        [Dec0]: [Dec3, Dec1];
        [Dec1]: [Dec4, Dec1];
        [Dec2]: [Dec5, Dec1];
        [Dec3]: [Dec6, Dec1];
        [Dec4]: [Dec7, Dec1];
        [Dec5]: [Dec8, Dec1];
        [Dec6]: [Dec9, Dec1];
        [Dec7]: [Dec0, Dec2];
        [Dec8]: [Dec1, Dec2];
        [Dec9]: [Dec2, Dec2];
      };
      [Dec9]: {
        [Dec0]: [Dec4, Dec1];
        [Dec1]: [Dec5, Dec1];
        [Dec2]: [Dec6, Dec1];
        [Dec3]: [Dec7, Dec1];
        [Dec4]: [Dec8, Dec1];
        [Dec5]: [Dec9, Dec1];
        [Dec6]: [Dec0, Dec2];
        [Dec7]: [Dec1, Dec2];
        [Dec8]: [Dec2, Dec2];
        [Dec9]: [Dec3, Dec2];
      };
    };
    [Dec6]: {
      [Dec0]: {
        [Dec0]: [Dec6, Dec0];
        [Dec1]: [Dec7, Dec0];
        [Dec2]: [Dec8, Dec0];
        [Dec3]: [Dec9, Dec0];
        [Dec4]: [Dec0, Dec1];
        [Dec5]: [Dec1, Dec1];
        [Dec6]: [Dec2, Dec1];
        [Dec7]: [Dec3, Dec1];
        [Dec8]: [Dec4, Dec1];
        [Dec9]: [Dec5, Dec1];
      };
      [Dec1]: {
        [Dec0]: [Dec7, Dec0];
        [Dec1]: [Dec8, Dec0];
        [Dec2]: [Dec9, Dec0];
        [Dec3]: [Dec0, Dec1];
        [Dec4]: [Dec1, Dec1];
        [Dec5]: [Dec2, Dec1];
        [Dec6]: [Dec3, Dec1];
        [Dec7]: [Dec4, Dec1];
        [Dec8]: [Dec5, Dec1];
        [Dec9]: [Dec6, Dec1];
      };
      [Dec2]: {
        [Dec0]: [Dec8, Dec0];
        [Dec1]: [Dec9, Dec0];
        [Dec2]: [Dec0, Dec1];
        [Dec3]: [Dec1, Dec1];
        [Dec4]: [Dec2, Dec1];
        [Dec5]: [Dec3, Dec1];
        [Dec6]: [Dec4, Dec1];
        [Dec7]: [Dec5, Dec1];
        [Dec8]: [Dec6, Dec1];
        [Dec9]: [Dec7, Dec1];
      };
      [Dec3]: {
        [Dec0]: [Dec9, Dec0];
        [Dec1]: [Dec0, Dec1];
        [Dec2]: [Dec1, Dec1];
        [Dec3]: [Dec2, Dec1];
        [Dec4]: [Dec3, Dec1];
        [Dec5]: [Dec4, Dec1];
        [Dec6]: [Dec5, Dec1];
        [Dec7]: [Dec6, Dec1];
        [Dec8]: [Dec7, Dec1];
        [Dec9]: [Dec8, Dec1];
      };
      [Dec4]: {
        [Dec0]: [Dec0, Dec1];
        [Dec1]: [Dec1, Dec1];
        [Dec2]: [Dec2, Dec1];
        [Dec3]: [Dec3, Dec1];
        [Dec4]: [Dec4, Dec1];
        [Dec5]: [Dec5, Dec1];
        [Dec6]: [Dec6, Dec1];
        [Dec7]: [Dec7, Dec1];
        [Dec8]: [Dec8, Dec1];
        [Dec9]: [Dec9, Dec1];
      };
      [Dec5]: {
        [Dec0]: [Dec1, Dec1];
        [Dec1]: [Dec2, Dec1];
        [Dec2]: [Dec3, Dec1];
        [Dec3]: [Dec4, Dec1];
        [Dec4]: [Dec5, Dec1];
        [Dec5]: [Dec6, Dec1];
        [Dec6]: [Dec7, Dec1];
        [Dec7]: [Dec8, Dec1];
        [Dec8]: [Dec9, Dec1];
        [Dec9]: [Dec0, Dec2];
      };
      [Dec6]: {
        [Dec0]: [Dec2, Dec1];
        [Dec1]: [Dec3, Dec1];
        [Dec2]: [Dec4, Dec1];
        [Dec3]: [Dec5, Dec1];
        [Dec4]: [Dec6, Dec1];
        [Dec5]: [Dec7, Dec1];
        [Dec6]: [Dec8, Dec1];
        [Dec7]: [Dec9, Dec1];
        [Dec8]: [Dec0, Dec2];
        [Dec9]: [Dec1, Dec2];
      };
      [Dec7]: {
        [Dec0]: [Dec3, Dec1];
        [Dec1]: [Dec4, Dec1];
        [Dec2]: [Dec5, Dec1];
        [Dec3]: [Dec6, Dec1];
        [Dec4]: [Dec7, Dec1];
        [Dec5]: [Dec8, Dec1];
        [Dec6]: [Dec9, Dec1];
        [Dec7]: [Dec0, Dec2];
        [Dec8]: [Dec1, Dec2];
        [Dec9]: [Dec2, Dec2];
      };
      [Dec8]: {
        [Dec0]: [Dec4, Dec1];
        [Dec1]: [Dec5, Dec1];
        [Dec2]: [Dec6, Dec1];
        [Dec3]: [Dec7, Dec1];
        [Dec4]: [Dec8, Dec1];
        [Dec5]: [Dec9, Dec1];
        [Dec6]: [Dec0, Dec2];
        [Dec7]: [Dec1, Dec2];
        [Dec8]: [Dec2, Dec2];
        [Dec9]: [Dec3, Dec2];
      };
      [Dec9]: {
        [Dec0]: [Dec5, Dec1];
        [Dec1]: [Dec6, Dec1];
        [Dec2]: [Dec7, Dec1];
        [Dec3]: [Dec8, Dec1];
        [Dec4]: [Dec9, Dec1];
        [Dec5]: [Dec0, Dec2];
        [Dec6]: [Dec1, Dec2];
        [Dec7]: [Dec2, Dec2];
        [Dec8]: [Dec3, Dec2];
        [Dec9]: [Dec4, Dec2];
      };
    };
    [Dec7]: {
      [Dec0]: {
        [Dec0]: [Dec7, Dec0];
        [Dec1]: [Dec8, Dec0];
        [Dec2]: [Dec9, Dec0];
        [Dec3]: [Dec0, Dec1];
        [Dec4]: [Dec1, Dec1];
        [Dec5]: [Dec2, Dec1];
        [Dec6]: [Dec3, Dec1];
        [Dec7]: [Dec4, Dec1];
        [Dec8]: [Dec5, Dec1];
        [Dec9]: [Dec6, Dec1];
      };
      [Dec1]: {
        [Dec0]: [Dec8, Dec0];
        [Dec1]: [Dec9, Dec0];
        [Dec2]: [Dec0, Dec1];
        [Dec3]: [Dec1, Dec1];
        [Dec4]: [Dec2, Dec1];
        [Dec5]: [Dec3, Dec1];
        [Dec6]: [Dec4, Dec1];
        [Dec7]: [Dec5, Dec1];
        [Dec8]: [Dec6, Dec1];
        [Dec9]: [Dec7, Dec1];
      };
      [Dec2]: {
        [Dec0]: [Dec9, Dec0];
        [Dec1]: [Dec0, Dec1];
        [Dec2]: [Dec1, Dec1];
        [Dec3]: [Dec2, Dec1];
        [Dec4]: [Dec3, Dec1];
        [Dec5]: [Dec4, Dec1];
        [Dec6]: [Dec5, Dec1];
        [Dec7]: [Dec6, Dec1];
        [Dec8]: [Dec7, Dec1];
        [Dec9]: [Dec8, Dec1];
      };
      [Dec3]: {
        [Dec0]: [Dec0, Dec1];
        [Dec1]: [Dec1, Dec1];
        [Dec2]: [Dec2, Dec1];
        [Dec3]: [Dec3, Dec1];
        [Dec4]: [Dec4, Dec1];
        [Dec5]: [Dec5, Dec1];
        [Dec6]: [Dec6, Dec1];
        [Dec7]: [Dec7, Dec1];
        [Dec8]: [Dec8, Dec1];
        [Dec9]: [Dec9, Dec1];
      };
      [Dec4]: {
        [Dec0]: [Dec1, Dec1];
        [Dec1]: [Dec2, Dec1];
        [Dec2]: [Dec3, Dec1];
        [Dec3]: [Dec4, Dec1];
        [Dec4]: [Dec5, Dec1];
        [Dec5]: [Dec6, Dec1];
        [Dec6]: [Dec7, Dec1];
        [Dec7]: [Dec8, Dec1];
        [Dec8]: [Dec9, Dec1];
        [Dec9]: [Dec0, Dec2];
      };
      [Dec5]: {
        [Dec0]: [Dec2, Dec1];
        [Dec1]: [Dec3, Dec1];
        [Dec2]: [Dec4, Dec1];
        [Dec3]: [Dec5, Dec1];
        [Dec4]: [Dec6, Dec1];
        [Dec5]: [Dec7, Dec1];
        [Dec6]: [Dec8, Dec1];
        [Dec7]: [Dec9, Dec1];
        [Dec8]: [Dec0, Dec2];
        [Dec9]: [Dec1, Dec2];
      };
      [Dec6]: {
        [Dec0]: [Dec3, Dec1];
        [Dec1]: [Dec4, Dec1];
        [Dec2]: [Dec5, Dec1];
        [Dec3]: [Dec6, Dec1];
        [Dec4]: [Dec7, Dec1];
        [Dec5]: [Dec8, Dec1];
        [Dec6]: [Dec9, Dec1];
        [Dec7]: [Dec0, Dec2];
        [Dec8]: [Dec1, Dec2];
        [Dec9]: [Dec2, Dec2];
      };
      [Dec7]: {
        [Dec0]: [Dec4, Dec1];
        [Dec1]: [Dec5, Dec1];
        [Dec2]: [Dec6, Dec1];
        [Dec3]: [Dec7, Dec1];
        [Dec4]: [Dec8, Dec1];
        [Dec5]: [Dec9, Dec1];
        [Dec6]: [Dec0, Dec2];
        [Dec7]: [Dec1, Dec2];
        [Dec8]: [Dec2, Dec2];
        [Dec9]: [Dec3, Dec2];
      };
      [Dec8]: {
        [Dec0]: [Dec5, Dec1];
        [Dec1]: [Dec6, Dec1];
        [Dec2]: [Dec7, Dec1];
        [Dec3]: [Dec8, Dec1];
        [Dec4]: [Dec9, Dec1];
        [Dec5]: [Dec0, Dec2];
        [Dec6]: [Dec1, Dec2];
        [Dec7]: [Dec2, Dec2];
        [Dec8]: [Dec3, Dec2];
        [Dec9]: [Dec4, Dec2];
      };
      [Dec9]: {
        [Dec0]: [Dec6, Dec1];
        [Dec1]: [Dec7, Dec1];
        [Dec2]: [Dec8, Dec1];
        [Dec3]: [Dec9, Dec1];
        [Dec4]: [Dec0, Dec2];
        [Dec5]: [Dec1, Dec2];
        [Dec6]: [Dec2, Dec2];
        [Dec7]: [Dec3, Dec2];
        [Dec8]: [Dec4, Dec2];
        [Dec9]: [Dec5, Dec2];
      };
    };
    [Dec8]: {
      [Dec0]: {
        [Dec0]: [Dec8, Dec0];
        [Dec1]: [Dec9, Dec0];
        [Dec2]: [Dec0, Dec1];
        [Dec3]: [Dec1, Dec1];
        [Dec4]: [Dec2, Dec1];
        [Dec5]: [Dec3, Dec1];
        [Dec6]: [Dec4, Dec1];
        [Dec7]: [Dec5, Dec1];
        [Dec8]: [Dec6, Dec1];
        [Dec9]: [Dec7, Dec1];
      };
      [Dec1]: {
        [Dec0]: [Dec9, Dec0];
        [Dec1]: [Dec0, Dec1];
        [Dec2]: [Dec1, Dec1];
        [Dec3]: [Dec2, Dec1];
        [Dec4]: [Dec3, Dec1];
        [Dec5]: [Dec4, Dec1];
        [Dec6]: [Dec5, Dec1];
        [Dec7]: [Dec6, Dec1];
        [Dec8]: [Dec7, Dec1];
        [Dec9]: [Dec8, Dec1];
      };
      [Dec2]: {
        [Dec0]: [Dec0, Dec1];
        [Dec1]: [Dec1, Dec1];
        [Dec2]: [Dec2, Dec1];
        [Dec3]: [Dec3, Dec1];
        [Dec4]: [Dec4, Dec1];
        [Dec5]: [Dec5, Dec1];
        [Dec6]: [Dec6, Dec1];
        [Dec7]: [Dec7, Dec1];
        [Dec8]: [Dec8, Dec1];
        [Dec9]: [Dec9, Dec1];
      };
      [Dec3]: {
        [Dec0]: [Dec1, Dec1];
        [Dec1]: [Dec2, Dec1];
        [Dec2]: [Dec3, Dec1];
        [Dec3]: [Dec4, Dec1];
        [Dec4]: [Dec5, Dec1];
        [Dec5]: [Dec6, Dec1];
        [Dec6]: [Dec7, Dec1];
        [Dec7]: [Dec8, Dec1];
        [Dec8]: [Dec9, Dec1];
        [Dec9]: [Dec0, Dec2];
      };
      [Dec4]: {
        [Dec0]: [Dec2, Dec1];
        [Dec1]: [Dec3, Dec1];
        [Dec2]: [Dec4, Dec1];
        [Dec3]: [Dec5, Dec1];
        [Dec4]: [Dec6, Dec1];
        [Dec5]: [Dec7, Dec1];
        [Dec6]: [Dec8, Dec1];
        [Dec7]: [Dec9, Dec1];
        [Dec8]: [Dec0, Dec2];
        [Dec9]: [Dec1, Dec2];
      };
      [Dec5]: {
        [Dec0]: [Dec3, Dec1];
        [Dec1]: [Dec4, Dec1];
        [Dec2]: [Dec5, Dec1];
        [Dec3]: [Dec6, Dec1];
        [Dec4]: [Dec7, Dec1];
        [Dec5]: [Dec8, Dec1];
        [Dec6]: [Dec9, Dec1];
        [Dec7]: [Dec0, Dec2];
        [Dec8]: [Dec1, Dec2];
        [Dec9]: [Dec2, Dec2];
      };
      [Dec6]: {
        [Dec0]: [Dec4, Dec1];
        [Dec1]: [Dec5, Dec1];
        [Dec2]: [Dec6, Dec1];
        [Dec3]: [Dec7, Dec1];
        [Dec4]: [Dec8, Dec1];
        [Dec5]: [Dec9, Dec1];
        [Dec6]: [Dec0, Dec2];
        [Dec7]: [Dec1, Dec2];
        [Dec8]: [Dec2, Dec2];
        [Dec9]: [Dec3, Dec2];
      };
      [Dec7]: {
        [Dec0]: [Dec5, Dec1];
        [Dec1]: [Dec6, Dec1];
        [Dec2]: [Dec7, Dec1];
        [Dec3]: [Dec8, Dec1];
        [Dec4]: [Dec9, Dec1];
        [Dec5]: [Dec0, Dec2];
        [Dec6]: [Dec1, Dec2];
        [Dec7]: [Dec2, Dec2];
        [Dec8]: [Dec3, Dec2];
        [Dec9]: [Dec4, Dec2];
      };
      [Dec8]: {
        [Dec0]: [Dec6, Dec1];
        [Dec1]: [Dec7, Dec1];
        [Dec2]: [Dec8, Dec1];
        [Dec3]: [Dec9, Dec1];
        [Dec4]: [Dec0, Dec2];
        [Dec5]: [Dec1, Dec2];
        [Dec6]: [Dec2, Dec2];
        [Dec7]: [Dec3, Dec2];
        [Dec8]: [Dec4, Dec2];
        [Dec9]: [Dec5, Dec2];
      };
      [Dec9]: {
        [Dec0]: [Dec7, Dec1];
        [Dec1]: [Dec8, Dec1];
        [Dec2]: [Dec9, Dec1];
        [Dec3]: [Dec0, Dec2];
        [Dec4]: [Dec1, Dec2];
        [Dec5]: [Dec2, Dec2];
        [Dec6]: [Dec3, Dec2];
        [Dec7]: [Dec4, Dec2];
        [Dec8]: [Dec5, Dec2];
        [Dec9]: [Dec6, Dec2];
      };
    };
    [Dec9]: {
      [Dec0]: {
        [Dec0]: [Dec9, Dec0];
        [Dec1]: [Dec0, Dec1];
        [Dec2]: [Dec1, Dec1];
        [Dec3]: [Dec2, Dec1];
        [Dec4]: [Dec3, Dec1];
        [Dec5]: [Dec4, Dec1];
        [Dec6]: [Dec5, Dec1];
        [Dec7]: [Dec6, Dec1];
        [Dec8]: [Dec7, Dec1];
        [Dec9]: [Dec8, Dec1];
      };
      [Dec1]: {
        [Dec0]: [Dec0, Dec1];
        [Dec1]: [Dec1, Dec1];
        [Dec2]: [Dec2, Dec1];
        [Dec3]: [Dec3, Dec1];
        [Dec4]: [Dec4, Dec1];
        [Dec5]: [Dec5, Dec1];
        [Dec6]: [Dec6, Dec1];
        [Dec7]: [Dec7, Dec1];
        [Dec8]: [Dec8, Dec1];
        [Dec9]: [Dec9, Dec1];
      };
      [Dec2]: {
        [Dec0]: [Dec1, Dec1];
        [Dec1]: [Dec2, Dec1];
        [Dec2]: [Dec3, Dec1];
        [Dec3]: [Dec4, Dec1];
        [Dec4]: [Dec5, Dec1];
        [Dec5]: [Dec6, Dec1];
        [Dec6]: [Dec7, Dec1];
        [Dec7]: [Dec8, Dec1];
        [Dec8]: [Dec9, Dec1];
        [Dec9]: [Dec0, Dec2];
      };
      [Dec3]: {
        [Dec0]: [Dec2, Dec1];
        [Dec1]: [Dec3, Dec1];
        [Dec2]: [Dec4, Dec1];
        [Dec3]: [Dec5, Dec1];
        [Dec4]: [Dec6, Dec1];
        [Dec5]: [Dec7, Dec1];
        [Dec6]: [Dec8, Dec1];
        [Dec7]: [Dec9, Dec1];
        [Dec8]: [Dec0, Dec2];
        [Dec9]: [Dec1, Dec2];
      };
      [Dec4]: {
        [Dec0]: [Dec3, Dec1];
        [Dec1]: [Dec4, Dec1];
        [Dec2]: [Dec5, Dec1];
        [Dec3]: [Dec6, Dec1];
        [Dec4]: [Dec7, Dec1];
        [Dec5]: [Dec8, Dec1];
        [Dec6]: [Dec9, Dec1];
        [Dec7]: [Dec0, Dec2];
        [Dec8]: [Dec1, Dec2];
        [Dec9]: [Dec2, Dec2];
      };
      [Dec5]: {
        [Dec0]: [Dec4, Dec1];
        [Dec1]: [Dec5, Dec1];
        [Dec2]: [Dec6, Dec1];
        [Dec3]: [Dec7, Dec1];
        [Dec4]: [Dec8, Dec1];
        [Dec5]: [Dec9, Dec1];
        [Dec6]: [Dec0, Dec2];
        [Dec7]: [Dec1, Dec2];
        [Dec8]: [Dec2, Dec2];
        [Dec9]: [Dec3, Dec2];
      };
      [Dec6]: {
        [Dec0]: [Dec5, Dec1];
        [Dec1]: [Dec6, Dec1];
        [Dec2]: [Dec7, Dec1];
        [Dec3]: [Dec8, Dec1];
        [Dec4]: [Dec9, Dec1];
        [Dec5]: [Dec0, Dec2];
        [Dec6]: [Dec1, Dec2];
        [Dec7]: [Dec2, Dec2];
        [Dec8]: [Dec3, Dec2];
        [Dec9]: [Dec4, Dec2];
      };
      [Dec7]: {
        [Dec0]: [Dec6, Dec1];
        [Dec1]: [Dec7, Dec1];
        [Dec2]: [Dec8, Dec1];
        [Dec3]: [Dec9, Dec1];
        [Dec4]: [Dec0, Dec2];
        [Dec5]: [Dec1, Dec2];
        [Dec6]: [Dec2, Dec2];
        [Dec7]: [Dec3, Dec2];
        [Dec8]: [Dec4, Dec2];
        [Dec9]: [Dec5, Dec2];
      };
      [Dec8]: {
        [Dec0]: [Dec7, Dec1];
        [Dec1]: [Dec8, Dec1];
        [Dec2]: [Dec9, Dec1];
        [Dec3]: [Dec0, Dec2];
        [Dec4]: [Dec1, Dec2];
        [Dec5]: [Dec2, Dec2];
        [Dec6]: [Dec3, Dec2];
        [Dec7]: [Dec4, Dec2];
        [Dec8]: [Dec5, Dec2];
        [Dec9]: [Dec6, Dec2];
      };
      [Dec9]: {
        [Dec0]: [Dec8, Dec1];
        [Dec1]: [Dec9, Dec1];
        [Dec2]: [Dec0, Dec2];
        [Dec3]: [Dec1, Dec2];
        [Dec4]: [Dec2, Dec2];
        [Dec5]: [Dec3, Dec2];
        [Dec6]: [Dec4, Dec2];
        [Dec7]: [Dec5, Dec2];
        [Dec8]: [Dec6, Dec2];
        [Dec9]: [Dec7, Dec2];
      };
    };
  };

  type Equals<A, B> = [A] extends [B]
    ? [B] extends [A]
      ? true
      : false
    : false;

  type And<A extends boolean, B extends boolean> = [A] extends [true]
    ? [B] extends [true]
      ? true
      : false
    : false;

  type StringContainsOnly<
    S extends string,
    Chars
  > = S extends `${infer Head}${infer Tail}`
    ? And<
        [Head] extends [Chars] ? true : false,
        StringContainsOnly<Tail, Chars>
      >
    : true;

  export type EqualLengthString<A extends string, B extends string> = Equals<
    A["length"],
    B["length"]
  >;

  type AddDec<
    Left extends Dec,
    Right extends Dec,
    Carry extends Dec = Dec0
  > = AddDecTable[Left][Right][Carry];

  export namespace AddDecTests {
    export const ad001: Equals<AddDec<Dec5, Dec7>, [Dec2, Dec1]> = true;
  }

  type AddDecs_<
    Left extends string,
    Right extends string
  > = Left extends `${infer LeftHead}${infer LeftTail}`
    ? Right extends `${infer RightHead}${infer RightTail}`
      ? AddDecs_<
          [LeftTail] extends [string] ? LeftTail : never,
          [RightTail] extends [string] ? RightTail : never
        > extends [infer ResultTail, infer TailCarry]
        ? AddDec<
            [LeftHead] extends [Dec] ? LeftHead : never,
            [RightHead] extends [Dec] ? RightHead : never,
            [TailCarry] extends [Dec] ? TailCarry : never
          > extends [infer ResultHead, infer NewResultCarry]
          ? [
              `${[ResultHead] extends [string] ? ResultHead : never}${[
                ResultTail
              ] extends [string]
                ? ResultTail
                : never}`,
              NewResultCarry
            ]
          : never
        : never
      : ["", Dec0]
    : ["", Dec0];

  type IsDecString<S extends string> = StringContainsOnly<S, Dec>;

  type AddDecs<Left extends string, Right extends string> = And<
    EqualLengthString<Left, Right>,
    And<IsDecString<Left>, IsDecString<Right>>
  > extends true
    ? AddDecs_<Left, Right> extends [infer Result, infer Carry]
      ? Carry extends Dec0
        ? Result
        : `${Carry extends Dec ? Carry : never}${Result extends string
            ? Result
            : never}`
      : never
    : never;

  export namespace AddDecsTest {
    export const ad001: Equals<AddDecs<"0", "0">, "0"> = true;
    export const ad002: Equals<AddDecs<"1", "2">, "3"> = true;
    export const ad003: Equals<AddDecs<"5", "7">, "12"> = true;

    export const ad004: Equals<AddDecs<"127", "364">, "491"> = true;

    // Max 13 digits
    type d = "0000000000000";
    // type d = '9999999999999';
    export const ad005: Equals<AddDecs<d, d>, d> = true;
  }
}
