const A_GRID = [

    'R    RR RR RRR                                                                             ',
    'R RR RR RR RRR                                                                             ',
    'R RR RR RR RRR RR RR RR RR RR  RRR R             FF   FFFFFFFFFFFF                         ',
    'R RR RR RR RRR RR RR RR RR RR  RRR R      RR FFFFFFFFFFFFFFFFFFFFF                         ',
    'R RR RR RR RRR RR RR RR RR RR  RRR R      RR FFFFFFFFFFFFFFFFFFFFF   F                     ',
    'R RR RR RR RRR RR RR RR RR RR  RRR R      RR FFFFFFFFFFFFFFFFFFFFF   F                     ',
    'R RR R   R RRR RR RR R   R RR  RRR R         FFFFFFFFFFFFFFFFFFFFF   F                     ',
    'W      W               W              WWW             WW           WWWC FFF  FFF W  FFFFFFF',
    '                                                                     FC FFF  FFF       FFFF',
    '                                                                     FC FFF  FFF       FFFF',
    '                                                                     FC FFF  FFF       FFFF',
    'R RR RR RR RRR RR RR RR RR RR  RRR RRR PP PP PP PP PP PP PP PP PP     C FFF  FFF       FFFF',
    'R RR RR RR RRR RR RR RR RR RR  RRR RRR PP PP PP PP PP PP PP PP PP     C FFF  FFF       FFFF',
    'R RR RR RR RRR RR RR RR RR RR  RRR RRR PP PP PP PP PP PP PP PP PP     C FFF  FFF       FFFF',
    'R RR RR RR RRR RR RR RR RR RR  RRR RRR PP PP PP PP PP PP PP PP PP     C FFF  FFF       FFFF',
    'R RR RR RR RRR RR RR RR RR RR  RRR RRR PP PP PP PP PP PP PP PP PP     C FFF  FFF       FFFF',
    'R RR RR RR RRR RR RR RR RR RR  RRR RRR PP PP PP PP PP PP PP PP PP     C FFF  FFF       FFFF',
    'R RR RR RR RRR RR RR RR RR RR  RRR RRR PP PP PP PP PP PP PP PP PP     C                FFFF',
    'CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC                 FFFF',
    'FF                                                                                     FFFF',
    'FF                                                                                     FFFF',
    'F                                                                                      FFFF',
    'F                     FFF                             FF                         FF    FFFF',
    'W    S W     S S S S   W  S S  S  S    W    S  S S S  W    S S S S  W  S S S S S W     FFFW',
    'F    S S  S  S S S S S SS S S  S  S  S SS S S  S S S S  S  S S S S S S S S S S S S S   FFFF',
    'F    S S  S  S S S S S SS S S  S  S  S SS S S  S S S S  S  S S S S S S S S S S S S S   FFFF',
    'F    S S  S  S S S S S SS S S  S  S  S SS S S  S S S S  S  S S S S S S S S S S S S S   FFFF',
    'F    S S  S  S S S S S SS S S  S  S  S SS S S  S S S S  S  S S S S S S S S S S S S S       ',
    '                                                                                           ',
    '                                                                                           ',
    '                                                                                           ',
    '       W   SS SS SS    W  SS SS SS SS  W  S S  S S S  W FF          W FFFFFFFFFFFW        W',
    '           SS SS SS SS SS SS SS SS SS SSS S S  S S S   FFF FFF FFFFFFFFFFFFFFFFFFFFF     FF',
    '           SS SS SS SS SS SS SS SS SS SSS S S  S S S   FFF FFF FFFFFFFFFFFFFFFFFFFFF     FF',
    '           SS SS SS SS SS SS SS SS SS SSS S S  S S S S FFF FFF FFFFFFFFFFFFFFFFFFFFF       ',
    '                                                                                       FF F',
    '                                                                                       FF  ',
    '                                                                                       FF  ',
    'FFFFFFFFFFFFFF                                                                         FF  ',
    'FFFFFFFFFFFFFF               FFFFFFFFF   FFFFFFFFFFFFF  FFFFFFFFFFF   FFFFFFFFFFF      FF  ',
    'FFFFFF W FFFFF         W FFF FFFFFFFFF W FFFFFFFFFFFFFW FFFFFFFFFFF W FFFFFFFFFFFW  FFF   W',

];


const A_LABELS = [
    [0, 5, "IC 7"],
    [0, 6, "IC 19"],
    [0, 8, "IC 20"],
    [0, 9, "IC 32"],
    [0, 11, "IC 33"],
    [0, 12, "IC 46"],
    [1, 2, "S 02"],
    [1, 3, "IC 6"],
    [1, 5, "IC 8"],
    [1, 6, "IC 18"],
    [1, 8, "IC 21"],
    [1, 9, "IC 31"],
    [1, 11, "IC 34"],
    [1, 12, "IC 45"],
    [2, 2, "S 03"],
    [2, 3, "IC 5"],
    [2, 5, "IC 9"],
    [2, 6, "IC 17"],
    [2, 8, "IC 22"],
    [2, 9, "IC 30"],
    [2, 11, "IC 35"],
    [2, 12, "IC 44"],
    [2, 15, "IC 47"],
    [2, 16, "IC 56"],
    [2, 18, "IC 57"],
    [2, 19, "IC 66"],
    [2, 21, "IC 67"],
    [2, 22, "IC 75"],
    [2, 24, "IC 76"],
    [2, 25, "IC 84"],
    [2, 27, "IC 85"],
    [2, 28, "IC 94"],
    [2, 31, "IC 95"],
    [2, 32, "IC 104"],
    [2, 35, "IC 105"],
    [3, 2, "S 04"],
    [3, 3, "IC 4"],
    [3, 5, "IC 10"],
    [3, 6, "IC 16"],
    [3, 8, "IC 23"],
    [3, 9, "IC 29"],
    [3, 11, "IC 36"],
    [3, 12, "IC 43"],
    [3, 15, "IC 48"],
    [3, 16, "IC 55"],
    [3, 18, "IC 58"],
    [3, 19, "IC 65"],
    [3, 21, "IC 68"],
    [3, 22, "IC 74"],
    [3, 24, "IC 77"],
    [3, 25, "IC 83"],
    [3, 27, "IC 86"],
    [3, 28, "IC 93"],
    [3, 31, "IC 96"],
    [3, 32, "IC 103"],
    [3, 35, "IC 106"],
    [3, 42, "G 03"],
    [3, 43, "G 06"],
    [4, 2, "S 05"],
    [4, 3, "IC 3"],
    [4, 5, "IC 11"],
    [4, 6, "IC 15"],
    [4, 8, "IC 24"],
    [4, 9, "IC 28"],
    [4, 11, "IC 37"],
    [4, 12, "IC 42"],
    [4, 15, "IC 49"],
    [4, 16, "IC 54"],
    [4, 18, "IC 59"],
    [4, 19, "IC 64"],
    [4, 21, "IC 69"],
    [4, 22, "IC 73"],
    [4, 24, "IC 78"],
    [4, 25, "IC 82"],
    [4, 27, "IC 87"],
    [4, 28, "IC 92"],
    [4, 31, "IC 97"],
    [4, 32, "IC 102"],
    [4, 35, "IC 107"],
    [4, 42, "G 02"],
    [4, 43, "G 05"],
    [5, 2, "S 06"],
    [5, 3, "IC 2"],
    [5, 5, "IC 12"],
    [5, 6, "IC 14"],
    [5, 8, "IC 25"],
    [5, 9, "IC 27"],
    [5, 11, "IC 38"],
    [5, 12, "IC 41"],
    [5, 15, "IC 50"],
    [5, 16, "IC 53"],
    [5, 18, "IC 60"],
    [5, 19, "IC 63"],
    [5, 21, "IC 70"],
    [5, 22, "IC 72"],
    [5, 24, "IC 79"],
    [5, 25, "IC 81"],
    [5, 27, "IC 88"],
    [5, 28, "IC 91"],
    [5, 31, "IC 98"],
    [5, 32, "IC 101"],
    [5, 35, "IC 108"],
    [5, 42, "G 01"],
    [5, 43, "G 04"],
    [6, 2, "S 07"],
    [6, 3, "IC 1"],
    [6, 5, "IC 13"],
    [6, 9, "IC 26"],
    [6, 11, "IC 39"],
    [6, 12, "IC 40"],
    [6, 15, "IC 51"],
    [6, 16, "IC 52"],
    [6, 18, "IC 61"],
    [6, 19, "IC 62"],
    [6, 21, "IC 71"],
    [6, 25, "IC 80"],
    [6, 27, "IC 89"],
    [6, 28, "IC 90"],
    [6, 31, "IC 99"],
    [6, 32, "IC 100"],
    [6, 35, "IC 109"],
    [11, 2, "S 08"],
    [11, 3, "RH 01"],
    [11, 5, "RH 10"],
    [11, 6, "RH 11"],
    [11, 8, "RH 20"],
    [11, 9, "RH 21"],
    [11, 11, "RH 30"],
    [11, 12, "RH 31"],
    [11, 15, "RH 40"],
    [11, 16, "RH 41"],
    [11, 18, "RH 50"],
    [11, 19, "RH 51"],
    [11, 21, "RH 60"],
    [11, 22, "RH 61"],
    [11, 24, "RH 70"],
    [11, 25, "RH 71"],
    [11, 27, "RH 80"],
    [11, 28, "RH 81"],
    [11, 31, "RH 90"],
    [11, 32, "RH 91"],
    [11, 35, "RH 100"],
    [11, 36, "RH 101"],
    [11, 39, "PM 07"],
    [11, 40, "PM 14"],
    [11, 42, "PM 21"],
    [11, 43, "PM 28"],
    [11, 45, "PM 35"],
    [11, 46, "PM 42"],
    [11, 48, "PM 49"],
    [11, 49, "PM 56"],
    [11, 51, "PM 63"],
    [11, 52, "PM 70"],
    [11, 54, "PM 77"],
    [11, 55, "PM 84"],
    [11, 57, "PM 91"],
    [11, 58, "PM 98"],
    [11, 60, "PM 105"],
    [11, 61, "PM 112"],
    [11, 63, "PM 119"],
    [11, 64, "PM 126"],
    [12, 39, "PM 06"],
    [12, 40, "PM 13"],
    [12, 42, "PM 20"],
    [12, 43, "PM 27"],
    [12, 45, "PM 34"],
    [12, 46, "PM 41"],
    [12, 48, "PM 48"],
    [12, 49, "PM 55"],
    [12, 51, "PM 62"],
    [12, 52, "PM 69"],
    [12, 54, "PM 76"],
    [12, 55, "PM 83"],
    [12, 57, "PM 90"],
    [12, 58, "PM 97"],
    [12, 60, "PM 104"],
    [12, 61, "PM 111"],
    [12, 63, "PM 118"],
    [12, 64, "PM 125"],
    [13, 2, "S 09"],
    [13, 3, "RH 02"],
    [13, 5, "RH 09"],
    [13, 6, "RH 12"],
    [13, 8, "RH 19"],
    [13, 9, "RH 22"],
    [13, 11, "RH 29"],
    [13, 12, "RH 32"],
    [13, 15, "RH 39"],
    [13, 16, "RH 42"],
    [13, 18, "RH 49"],
    [13, 19, "RH 52"],
    [13, 21, "RH 59"],
    [13, 22, "RH 62"],
    [13, 24, "RH 69"],
    [13, 25, "RH 72"],
    [13, 27, "RH 79"],
    [13, 28, "RH 82"],
    [13, 31, "RH 89"],
    [13, 32, "RH 92"],
    [13, 35, "RH 99"],
    [13, 36, "RH 102"],
    [13, 39, "PM 05"],
    [13, 40, "PM 12"],
    [13, 42, "PM 19"],
    [13, 43, "PM 26"],
    [13, 45, "PM 33"],
    [13, 46, "PM 40"],
    [13, 48, "PM 47"],
    [13, 49, "PM 54"],
    [13, 51, "PM 61"],
    [13, 52, "PM 68"],
    [13, 54, "PM 75"],
    [13, 55, "PM 82"],
    [13, 57, "PM 89"],
    [13, 58, "PM 96"],
    [13, 60, "PM 103"],
    [13, 61, "PM 110"],
    [13, 63, "PM 117"],
    [13, 64, "PM 124"],
    [14, 39, "PM 04"],
    [14, 40, "PM 11"],
    [14, 42, "PM 18"],
    [14, 43, "PM 25"],
    [14, 45, "PM 32"],
    [14, 46, "PM 39"],
    [14, 48, "PM 46"],
    [14, 49, "PM 53"],
    [14, 51, "PM 60"],
    [14, 52, "PM 67"],
    [14, 54, "PM 74"],
    [14, 55, "PM 81"],
    [14, 57, "PM 88"],
    [14, 58, "PM 95"],
    [14, 60, "PM 102"],
    [14, 61, "PM 109"],
    [14, 63, "PM 116"],
    [14, 64, "PM 123"],
    [15, 2, "1AGY"],
    [15, 3, "RH 03"],
    [15, 5, "RH 08"],
    [15, 6, "RH 13"],
    [15, 8, "RH 18"],
    [15, 9, "RH 23"],
    [15, 11, "RH 28"],
    [15, 12, "RH 33"],
    [15, 15, "RH 38"],
    [15, 16, "RH 43"],
    [15, 18, "RH 48"],
    [15, 19, "RH 53"],
    [15, 21, "RH 58"],
    [15, 22, "RH 63"],
    [15, 24, "RH 68"],
    [15, 25, "RH 73"],
    [15, 27, "RH 78"],
    [15, 28, "RH 83"],
    [15, 31, "RH 88"],
    [15, 32, "RH 93"],
    [15, 35, "RH 98"],
    [15, 36, "RH 103"],
    [15, 39, "PM 03"],
    [15, 40, "PM 10"],
    [15, 42, "PM 17"],
    [15, 43, "PM 24"],
    [15, 45, "PM 31"],
    [15, 46, "PM 38"],
    [15, 48, "PM 45"],
    [15, 49, "PM 52"],
    [15, 51, "PM 59"],
    [15, 52, "PM 66"],
    [15, 54, "PM 73"],
    [15, 55, "PM 80"],
    [15, 57, "PM 87"],
    [15, 58, "PM 94"],
    [15, 60, "PM 101"],
    [15, 61, "PM 108"],
    [15, 63, "PM 115"],
    [15, 64, "PM 122"],
    [16, 2, "1COX"],
    [16, 3, "RH 04"],
    [16, 5, "RH 07"],
    [16, 6, "RH 14"],
    [16, 8, "RH 17"],
    [16, 9, "RH 24"],
    [16, 11, "RH 27"],
    [16, 12, "RH 34"],
    [16, 15, "RH 37"],
    [16, 16, "RH 44"],
    [16, 18, "RH 47"],
    [16, 19, "RH 54"],
    [16, 21, "RH 57"],
    [16, 22, "RH 64"],
    [16, 24, "RH 67"],
    [16, 25, "RH 74"],
    [16, 27, "RH 77"],
    [16, 28, "RH 84"],
    [16, 31, "RH 87"],
    [16, 32, "RH 94"],
    [16, 35, "RH 97"],
    [16, 36, "RH 104"],
    [16, 39, "PM 02"],
    [16, 40, "PM 9"],
    [16, 42, "PM 16"],
    [16, 43, "PM 23"],
    [16, 45, "PM 30"],
    [16, 46, "PM 37"],
    [16, 48, "PM 44"],
    [16, 49, "PM 51"],
    [16, 51, "PM 58"],
    [16, 52, "PM 65"],
    [16, 54, "PM 72"],
    [16, 55, "PM 79"],
    [16, 57, "PM 86"],
    [16, 58, "PM 93"],
    [16, 60, "PM 100"],
    [16, 61, "PM 107"],
    [16, 63, "PM 114"],
    [16, 64, "PM 121"],
    [17, 2, "1COX"],
    [17, 3, "RH 05"],
    [17, 5, "RH 06"],
    [17, 6, "RH 15"],
    [17, 8, "RH 16"],
    [17, 9, "RH 25"],
    [17, 11, "RH 26"],
    [17, 12, "RH 35"],
    [17, 15, "RH 36"],
    [17, 16, "RH 45"],
    [17, 18, "RH 46"],
    [17, 19, "RH 55"],
    [17, 21, "RH 56"],
    [17, 22, "RH 65"],
    [17, 24, "RH 66"],
    [17, 25, "RH 75"],
    [17, 27, "RH 76"],
    [17, 28, "RH 85"],
    [17, 31, "RH 86"],
    [17, 32, "RH 95"],
    [17, 35, "RH 96"],
    [17, 36, "RH 105"],
    [17, 39, "PM 01"],
    [17, 40, "PM 8"],
    [17, 42, "PM 15"],
    [17, 43, "PM 22"],
    [17, 45, "PM 29"],
    [17, 46, "PM 36"],
    [17, 48, "PM 43"],
    [17, 49, "PM 50"],
    [17, 51, "PM 57"],
    [17, 52, "PM 64"],
    [17, 54, "PM 71"],
    [17, 55, "PM 78"],
    [17, 57, "PM 85"],
    [17, 58, "PM 92"],
    [17, 60, "PM 99"],
    [17, 61, "PM 106"],
    [17, 63, "PM 113"],
    [17, 64, "PM 120"],
    [23, 5, "E05"],
    [23, 13, "E18"],
    [23, 15, "E23"],
    [23, 17, "D05"],
    [23, 19, "D10"],
    [23, 26, "C05"],
    [23, 28, "C10"],
    [23, 31, "C15"],
    [23, 34, "C20"],
    [23, 44, "B17"],
    [23, 47, "B22"],
    [23, 49, "B27"],
    [23, 51, "B32"],
    [23, 59, "A07"],
    [23, 61, "A12"],
    [23, 63, "A17"],
    [23, 65, "A22"],
    [23, 71, "A35"],
    [23, 73, "A40"],
    [23, 75, "A45"],
    [23, 77, "A50"],
    [23, 79, "A55"],
    [25, 5, "E04"],
    [25, 7, "E09"],
    [25, 10, "E13"],
    [25, 13, "E17"],
    [25, 15, "E22"],
    [25, 17, "D04"],
    [25, 19, "D09"],
    [25, 21, "D14"],
    [25, 23, "D18"],
    [25, 26, "C04"],
    [25, 28, "C09"],
    [25, 31, "C14"],
    [25, 34, "C19"],
    [25, 37, "B04"],
    [25, 39, "B08"],
    [25, 42, "B12"],
    [25, 44, "B16"],
    [25, 47, "B21"],
    [25, 49, "B26"],
    [25, 51, "B31"],
    [25, 53, "B36"],
    [25, 56, "A02"],
    [25, 59, "A06"],
    [25, 61, "A11"],
    [25, 63, "A16"],
    [25, 65, "A21"],
    [25, 67, "A26"],
    [25, 69, "A30"],
    [25, 71, "A34"],
    [25, 73, "A39"],
    [25, 75, "A44"],
    [25, 77, "A49"],
    [25, 79, "A54"],
    [25, 81, "A59"],
    [25, 83, "A63"],
    [27, 5, "E03"],
    [27, 7, "E08"],
    [27, 10, "E12"],
    [27, 13, "E16"],
    [27, 15, "E21"],
    [27, 17, "D03"],
    [27, 19, "D08"],
    [27, 21, "D13"],
    [27, 23, "D17"],
    [27, 26, "C03"],
    [27, 28, "C08"],
    [27, 31, "C13"],
    [27, 34, "C18"],
    [27, 37, "B03"],
    [27, 39, "B07"],
    [27, 42, "B11"],
    [27, 44, "B15"],
    [27, 47, "B20"],
    [27, 49, "B25"],
    [27, 51, "B30"],
    [27, 53, "B35"],
    [27, 56, "A01"],
    [27, 59, "A05"],
    [27, 61, "A10"],
    [27, 63, "A15"],
    [27, 65, "A20"],
    [27, 67, "A25"],
    [27, 69, "A29"],
    [27, 71, "A33"],
    [27, 73, "A38"],
    [27, 75, "A43"],
    [27, 77, "A48"],
    [27, 79, "A53"],
    [27, 81, "A57"],
    [27, 83, "A62"],
    [31, 15, "E19"],
    [31, 17, "D01"],
    [31, 26, "C01"],
    [31, 42, "B09"],
    [31, 44, "B13"],
    [31, 47, "B18"],
    [31, 49, "B23"],
    [31, 51, "B28"],
    [31, 11, "E02"],
    [31, 12, "E07"],
    [31, 14, "E11"],
    [31, 18, "E15"],
    [26, 15, "E20"],
    [27, 24, "D02"],
    [31, 27, "D07"],
    [31, 29, "D12"],
    [31, 30, "D16"],
    [31, 32, "C02"],
    [31, 33, "C07"],
    [31, 35, "C12"],
    [31, 36, "C17"],
    [27, 40, "B02"],
    [26, 39, "B06"],
    [26, 42, "B10"],
    [26, 44, "B14"],
    [26, 47, "B19"],
    [26, 49, "B24"],
    [26, 51, "B29"],
    [26, 53, "B34"],
    [26, 56, "B38"],
    [26, 59, "A04"],
    [26, 61, "A09"],
    [26, 63, "A14"],
    [26, 65, "A19"],
    [26, 67, "A24"],
    [26, 69, "A28"],
    [26, 71, "A32"],
    [26, 73, "A37"],
    [26, 75, "A42"],
    [26, 77, "A47"],
    [26, 79, "A52"],
    [26, 81, "A55"],
    [26, 83, "A61"],
    [32, 11, "E01"],
    [32, 12, "E06"],
    [32, 14, "E10"],
    [32, 15, "E14"],
    [32, 18, "D06"],
    [32, 21, "D11"],
    [32, 23, "D15"],
    [32, 27, "C06"],
    [32, 30, "C11"],
    [32, 33, "C16"],
    [32, 36, "B01"],
    [32, 39, "B05"],
    [32, 51, "B33"],
    [32, 49, "B37"],
    [32, 47, "A03"],
    [32, 44, "A08"],
    [32, 42, "A13"],
    [33, 51, "A18"],
    [32, 40, "A23"],
    [33, 49, "A27"],
    [32, 38, "A31"],
    [33, 47, "A36"],
    [32, 35, "A41"],
    [33, 44, "A46"],
    [34, 53, "A51"],
    [32, 32, "A53"],
    [33, 42, "A60"],
    [34, 11, "F24"],
    [34, 12, "F27"],
    [34, 14, "E31"],
    [34, 15, "E35"],
    [34, 17, "E47"],
    [34, 18, "E51"],
    [34, 26, "C32"],
    [34, 27, "C36"],
    [34, 29, "C40"],
    [34, 30, "C44"],
    [34, 32, "C48"],
    [34, 33, "C52"],
    [34, 35, "C56"],
    [34, 36, "C60"],
    [34, 42, "C70"],
    [34, 44, "B42"],
    [34, 47, "B46"],
    [34, 49, "B50"],
    [34, 51, "B54"],
    [33, 11, "F23"],
    [34, 20, "F26"],
    [34, 21, "E30"],
    [34, 23, "E34"],
    [34, 24, "E46"],
    [33, 18, "E50"],
    [33, 20, "E54"],
    [33, 21, "E57"],
    [33, 23, "C23"],
    [33, 24, "C27"],
    [33, 26, "C31"],
    [33, 27, "C35"],
    [33, 29, "C39"],
    [34, 38, "C43"],
    [34, 39, "C47"],
    [34, 40, "C51"],
    [33, 35, "C55"],
    [33, 36, "C59"],
    [33, 38, "C63"],
    [33, 39, "C66"],
    [33, 40, "C69"],
    [33, 33, "B41"],
    [33, 32, "B45"],
    [33, 30, "B49"],
    [32, 29, "B53"],
    [33, 12, "F22"],
    [33, 14, "F25"],
    [33, 15, "E29"],
    [33, 17, "E33"],
    [32, 17, "E45"],
    [32, 20, "E49"],
    [32, 24, "E53"],
    [32, 26, "E56"],
    [26, 23, "C22"],
    [26, 24, "C26"],
    [26, 26, "C30"],
    [26, 28, "C34"],
    [26, 31, "C38"],
    [26, 34, "C42"],
    [26, 37, "C46"],
    [26, 40, "C50"],
    [26, 21, "C54"],
    [25, 40, "C58"],
    [26, 19, "C62"],
    [24, 39, "C65"],
    [24, 42, "C68"],
    [24, 44, "B40"],
    [24, 47, "B44"],
    [24, 49, "B48"],
    [24, 51, "B52"],
    [26, 10, "F21"],
    [26, 13, "F24"],
    [26, 17, "E28"],
    [26, 7, "E32"],
    [26, 5, "E44"],
    [25, 24, "E48"],
    [24, 19, "E52"],
    [24, 21, "E55"],
    [24, 23, "C21"],
    [24, 24, "C25"],
    [24, 26, "C29"],
    [24, 28, "C33"],
    [24, 31, "C37"],
    [24, 34, "C41"],
    [24, 37, "C45"],
    [24, 40, "C49"],
    [24, 17, "C53"],
    [24, 53, "C57"],
    [24, 56, "C61"],
    [24, 59, "C64"],
    [24, 61, "C67"],
    [24, 63, "B39"],
    [24, 65, "B43"],
    [24, 67, "B47"],
    [24, 69, "B51"],
    [24, 71, "B55"],
];


const A_FACILITIES = [
    { x0:49, z0:2, x1:50, z1:2, label:"真空包裝機", color:9268835 },
    { x0:54, z0:2, x1:57, z1:6, label:"退運備料區", color:8440772 },
    { x0:58, z0:2, x1:63, z1:6, label:"收貨區", color:16758605 },
    { x0:64, z0:2, x1:65, z1:6, label:"標籤檢查區", color:16766287 },
    { x0:45, z0:3, x1:53, z1:6, label:"IC備料區", color:8440772 },
    { x0:69, z0:4, x1:69, z1:4, label:"OCR", color:9159498 },
    { x0:69, z0:5, x1:69, z1:5, label:"電腦", color:9159498 },
    { x0:69, z0:6, x1:69, z1:6, label:"SQE電腦", color:9159498 },
    { x0:72, z0:7, x1:74, z1:16, label:"辦公區", color:9479342 },
    { x0:77, z0:7, x1:79, z1:16, label:"辦公區", color:9479342 },
    { x0:84, z0:7, x1:86, z1:7, label:"人員出入口", color:10586239 },
    { x0:87, z0:7, x1:90, z1:22, label:"X-Ray點料機/3台", color:11771355 },
    { x0:69, z0:8, x1:69, z1:10, label:"標籤列印機", color:7901340 },
    { x0:0, z0:19, x1:1, z1:20, label:"標籤列印機", color:7901340 },
    { x0:0, z0:21, x1:0, z1:22, label:"電箱", color:3622735 },
    { x0:22, z0:22, x1:24, z1:22, label:"電箱", color:3622735 },
    { x0:54, z0:22, x1:55, z1:22, label:"電箱", color:3622735 },
    { x0:81, z0:22, x1:82, z1:22, label:"電箱", color:3622735 },
    { x0:87, z0:23, x1:89, z1:23, label:"PMI1-1216AY", color:16758605 },
    { x0:0, z0:24, x1:0, z1:27, label:"烘箱", color:11887901 },
    { x0:87, z0:24, x1:90, z1:26, label:"上架區&/報廢區", color:16027569 },
    { x0:56, z0:31, x1:57, z1:34, label:"AMR區", color:5093036 },
    { x0:70, z0:31, x1:80, z1:31, label:"出庫", color:15037299 },
    { x0:55, z0:32, x1:57, z1:34, label:"AMR區", color:5093036 },
    { x0:59, z0:32, x1:61, z1:34, label:"智能料车/上料區", color:5227511 },
    { x0:63, z0:32, x1:69, z1:34, label:"分料區", color:8505220 },
    { x0:70, z0:32, x1:83, z1:34, label:"空蕩區", color:11583173 },
    { x0:89, z0:32, x1:90, z1:33, label:"點料區", color:10275941 },
    { x0:87, z0:35, x1:88, z1:39, label:"天車区", color:2541274 },
    { x0:90, z0:35, x1:90, z1:35, label:"生產看板", color:9159498 },
    { x0:0, z0:38, x1:13, z1:39, label:"配電室", color:4545124 },
    { x0:29, z0:39, x1:37, z1:40, label:"拼接區域2台", color:9795021 },
    { x0:41, z0:39, x1:53, z1:40, label:"拼接區域3台", color:9795021 },
    { x0:56, z0:39, x1:66, z1:40, label:"拼接區域3台", color:9795021 },
    { x0:70, z0:39, x1:80, z1:40, label:"拼接區域3台", color:9795021 },
    { x0:0, z0:40, x1:5, z1:40, label:"配電室", color:4545124 },
    { x0:9, z0:40, x1:13, z1:40, label:"配電室", color:4545124 },
    { x0:25, z0:40, x1:27, z1:40, label:"SAT备料區", color:8440772 },
    { x0:84, z0:40, x1:86, z1:40, label:"人員出入口", color:10586239 },
];
const A_CENTER_X = -160, A_CENTER_Z = -80;   // A 倉中心（世界；大空地避開 C/D）
const A_PITCH_X = 0.8;                        // 格寬（局部），世界 = ×1.5
const A_PITCH_Z = 1.2;                        // 格深（局部），世界 = ×1.5（長 1.8m）
const A_R = A_GRID.length;                    // 由使用者編輯的 A_GRID 自動推導
const A_C = A_GRID.reduce((m, rw) => Math.max(m, rw.length), 0);
const A_RX = (A_C * A_PITCH_X * 1.5) / 2 + 8; // 判斷在 A 倉的 x 半徑
const A_RZ = (A_R * A_PITCH_Z * 1.5) / 2 + 8; // 判斷在 A 倉的 z 半徑
const A_LABEL_MAP = (() => { const m = {}; A_LABELS.forEach(lb => m[lb[0] + '_' + lb[1]] = lb[2]); return m; })();
let awnGroup = null;                          // A 倉 root（scene 層級，同 D 倉）
function inAWorld(x, z) { return awnGroup && Math.abs(x - A_CENTER_X) <= A_RX && Math.abs(z - A_CENTER_Z) <= A_RZ; }
let awConv = null;   // 天車補料：傳送帶→柱位→上頂→下放→南移出倉（buildAWarehouse 建、animate 更新）
function buildAWarehouse() {
    if (!scene) return;
    if (awnGroup) { scene.remove(awnGroup); awnGroup.traverse(o => { if (o.geometry) o.geometry.dispose(); }); awnGroup = null; }
    awnGroup = new THREE.Group();
    awnGroup.position.set(A_CENTER_X, 0, A_CENTER_Z);
    awnGroup.scale.set(1.5, 1.5, 1.5);
    const halfX = (A_C - 1) / 2, halfZ = (A_R - 1) / 2;
    const LV_H = 0.45;   // 貨架區每層 0.45m
    // 地板
    const aMatFloor = new THREE.MeshLambertMaterial({ color: 0x59636e });
    const floor = new THREE.Mesh(new THREE.BoxGeometry(A_C * A_PITCH_X, 0.14, A_R * A_PITCH_Z), aMatFloor);
    floor.position.set(0, -0.07, 0);
    awnGroup.add(floor);
    // ── 貨架區（IC/RH/S/PM/G）：銀柱＋深綠層板 ──
    const aMatPost = new THREE.MeshLambertMaterial({ color: 0xa8bac8 });
    const aMatCage = new THREE.MeshLambertMaterial({ color: 0x39424c });
    const postGeo  = new THREE.BoxGeometry(0.07, 1, 0.07);
    const plateGeo = new THREE.BoxGeometry(A_PITCH_X * 0.9, 0.05, A_PITCH_Z * 0.9);
    // ── SMT 開放式智能料架（下方 A~F）元件：全部獨立基礎幾何＋InstancedMesh 合併 ──
    // 實規格（世界）：寬1.2 × 深0.6 × 高1.8m、5層×層距0.3m、每層20顆7吋料盤(Ø0.18)
    const PX = A_PITCH_X, PD = 0.4, PH = 1.2;            // 局部：寬0.8 深0.4 高1.2
    const PSTEP = 0.2;                                   // 層距局部 0.2
    const POST_S = 0.05;                                 // 立柱截面 0.05 局部(0.075 世界)
    const REEL_R = 0.06, REEL_H = 0.017, REEL_T = 0.008; // 7"盤：外半徑/內孔/厚（局部）
    const reelShape = new THREE.Shape();
    reelShape.absarc(0, 0, REEL_R, 0, Math.PI * 2, false);
    const reelHole = new THREE.Path();
    reelHole.absarc(0, 0, REEL_H, 0, Math.PI * 2, true);
    reelShape.holes.push(reelHole);
    const reelGeo = new THREE.ExtrudeGeometry(reelShape, { depth: REEL_T, bevelEnabled: false });  // 圓盤含中央孔、軸沿 z
    const matPostS  = new THREE.MeshLambertMaterial({ color: 0xc3ccd4 });   // 鋁型材銀
    const matBeamS  = new THREE.MeshLambertMaterial({ color: 0xb8c2cb });   // 橫梁
    const matDiv    = new THREE.MeshLambertMaterial({ color: 0x1d2126 });   // 黑色垂直隔板
    const matReelM  = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const matLedM   = new THREE.MeshBasicMaterial({ color: 0xff4d4d });     // 每層前緣 3 顆紅 LED
    const matCasterM = new THREE.MeshLambertMaterial({ color: 0x111315 });  // 腳輪
    const matPoleM  = new THREE.MeshLambertMaterial({ color: 0x39424c });
    const matBcnM   = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const matPanelM = new THREE.MeshLambertMaterial({ color: 0x2a2d31 });   // 觸控屏機殼
    const matScreenM = new THREE.MeshBasicMaterial({ color: 0x9fd4ff });    // 螢幕
    const matBrcM   = new THREE.MeshLambertMaterial({ color: 0x8a959e });   // 支架
    const REEL_COLORS = [0x2f3439, 0x4c535c, 0x33506e, 0x56616b, 0x3a4048, 0x6b747d];
    const BCN_COLORS = [0xff2f2f, 0xffd43b, 0x3ddc4e];
    // 收集陣列（flat x,y,z）
    let _runStartX = 0;                              // 目前 SMT 連排起點（局部座標）
const pPost = [], pBeamF = [], pBeamR = [], pBeamS = [], pSupport = [], pDiv = [], pReel = [], pReelC = [], pColW = [], pColWS = [], pCart = [],
      pRunLv = [], pRunLen = [], pRunTop = [], pRunTopLen = [],
          pLed = [], pCaster = [], pPole = [], pBcn = [], pBnC = [], pPanel = [], pScreen = [], pBrk = [];
    // A 倉 19 行鐵籠：改「高聳網狀圍欄」造型（垂直/水平鋼絲線段＋四角立柱）
    const CAGE_H = 2.2;                       // 網籠高（局部 2.2＝世界 3.3m）
    const matCageSteel = new THREE.MeshLambertMaterial({ color: 0x9aa4ad });
    const cagePost = [], cageEnds = [];
    const colK = {};   // 每欄 S 的行清單（同欄 SMT 料架連成無縫一列）
    for (let c = 0; c < A_C; c++) { const rows = []; for (let r = 0; r < A_R; r++) if (A_GRID[r][c] === 'S') rows.push(r); if (rows.length) colK[c] = rows; }
    // W 柱子：WWWW 一段＝1 根柱（取段中心；A_WH 柱高、材質）
    const A_WH = 3.0, matColW = new THREE.MeshLambertMaterial({ color: 0xb9bfc6 });
    const cartonGeo = new THREE.BoxGeometry(0.34, 0.28, 0.34);   // 紙箱（與 C 倉同款 matUsedBox 貼圖）
    const W_RUNS = [];
    for (let r = 0; r < A_R; r++) {
        let j = 0;
        while (j < A_C) {
            if ((A_GRID[r][j] || ' ') !== 'W') { j++; continue; }
            let k = j; while (k < A_C && (A_GRID[r][k] || ' ') === 'W') k++;
            W_RUNS.push({ r: r, c0: j, c1: k - 1 }); j = k;
        }
    }
    for (let r = 0; r < A_R; r++) {
        for (let c = 0; c < A_C; c++) {
            const ch = (A_GRID[r][c] || ' ');
            const wx = (c - halfX) * A_PITCH_X, wz = (r - halfZ) * A_PITCH_Z;
            if (ch === 'R') {
                const lbl = A_LABEL_MAP[r + '_' + c];
                const lvN = lbl && /^IC/i.test(lbl) ? 6 : 5;
                const H = lvN * LV_H;
                [[-A_PITCH_X / 2 + 0.05, -A_PITCH_Z / 2 + 0.05], [A_PITCH_X / 2 - 0.05, -A_PITCH_Z / 2 + 0.05],
                 [-A_PITCH_X / 2 + 0.05, A_PITCH_Z / 2 - 0.05], [A_PITCH_X / 2 - 0.05, A_PITCH_Z / 2 - 0.05]].forEach(pt => {
                    const po = new THREE.Mesh(postGeo, aMatPost);
                    po.position.set(wx + pt[0], H / 2, wz + pt[1]); po.scale.y = H; awnGroup.add(po);
                });
                for (let lv = 0; lv < lvN; lv++) {
                    const pl = new THREE.Mesh(plateGeo, woodRackMat);
                    pl.position.set(wx, lv * LV_H + 0.025, wz); awnGroup.add(pl);
                    if (Math.random() < 0.7) {   // 70% 隨機放滿（避免倉庫太滿）
                        const by = lv * LV_H + 0.19;   // 層板上 2×2 紙箱
                        [[-0.17, -0.26], [0.17, -0.26], [-0.17, 0.26], [0.17, 0.26]].forEach(oz => {
                            pCart.push(wx + oz[0], by, wz + oz[1]);
                        });
                    }
                }
            } else if (ch === 'P') {
                // ===== 棧板：川字型（3 枕木、叉車兩向可入）＝黃木紋；50% 上方堆紙箱 =====
                const pg = new THREE.Group();
                (() => {
                    const w = A_PITCH_X * 0.9, d = A_PITCH_Z * 0.78, TB = 0.03, SH = 0.09;
                    const n = 5, bw2 = w * 0.093, st2 = (w - bw2) / (n - 1);       // 頂板 5 條＋明顯板縫
                    for (let i = 0; i < n; i++) {
                        const b = new THREE.Mesh(new THREE.BoxGeometry(bw2, TB, d), woodBaseMat);
                        b.position.set(-w / 2 + bw2 / 2 + i * st2, SH + TB / 2, 0); pg.add(b);
                    }
                    [-w / 3, 0, w / 3].forEach(ox => {                            // 川字三根枕木（叉車通道朝 ±z）
                        const st = new THREE.Mesh(new THREE.BoxGeometry(0.11, SH, d * 0.85), woodBaseMat);
                        st.position.set(ox, SH / 2, 0); pg.add(st);
                    });
                    [-w / 3, 0, w / 3].forEach(ox => {                            // 底板三小塊
                        const b = new THREE.Mesh(new THREE.BoxGeometry(0.09, TB, d * 0.5), woodBaseMat);
                        b.position.set(ox, TB / 2, 0); pg.add(b);
                    });
                })();
                pg.position.set(wx, 0, wz); awnGroup.add(pg);
                if (Math.random() < 0.5) {   // 棧板 50% 隨機才堆紙箱（其餘空川字托盤）
                    for (let pi = 0; pi < 2; pi++) {
                        const by = 0.12 + 0.14 + pi * 0.28;   // 底層＋第二層（棧板上）
                        [[-0.17, -0.17], [0.17, -0.17], [-0.17, 0.17], [0.17, 0.17]].forEach(oz => {
                            pCart.push(wx + oz[0], by, wz + oz[1]);
                        });
                    }
                }
            } else if (ch === 'S') {
                // ===== SMT 標準料架：一格一台 1200×600×1800（局部 0.8×0.4×1.2），整區旋轉 90°；同欄連排無縫 =====
                const pxc = wx;
                const pzc = wz;   // 一台對準一格：確保每個編號格子正下方都有料架（列距與 A_GRID 一致）
                // 1) 四根鋼柱（角點，整台轉 90° 後 x/z 對調）
                [[-0.36, -0.17], [0.36, -0.17], [-0.36, 0.17], [0.36, 0.17]].forEach(pt => { pPost.push(pxc + pt[1], PH / 2, pzc - pt[0]); });
                // 2) 5 層：橫梁＋支撐＋20 圓盤＋間隔板（全部轉 90°）
                for (let lv = 0; lv < 5; lv++) {
                    const ly = 0.12 + lv * PSTEP;
                    pBeamS.push(pxc, ly + 0.02, pzc + 0.38);   // 長側軌（沿 z，支撐圓盤）
                    pBeamS.push(pxc, ly + 0.02, pzc - 0.38);
                    const ry = ly + 0.09;
                    for (let i = 0; i < 20; i++) {
                        const sx = -0.36 + i * 0.0379;
                        pReel.push(pxc + 0.03, ry, pzc - sx);          // 圓盤排改沿 z
                        pReelC.push(REEL_COLORS[((r * 7 + lv * 13 + i) >>> 0) % REEL_COLORS.length]);
                        pDiv.push(pxc + 0.03, ry, pzc - (-0.38 + i * 0.04));   // 隔板同步
                    }
                    pDiv.push(pxc + 0.03, ry, pzc + 0.38);
                }
                // 3) 底 4 腳輪（角點，轉 90°）
                [[-0.36, -0.17], [0.36, -0.17], [-0.36, 0.17], [0.36, 0.17]].forEach(pt => { pCaster.push(pxc + pt[1], 0.035, pzc - pt[0]); });
                // 4) 頂部三色警示燈＋細桿（中央不變）
                pPole.push(pxc, PH + 0.08, pzc);
                pBcn.push(pxc, PH + 0.15, pzc); pBnC.push(BCN_COLORS[0]);
                pBcn.push(pxc, PH + 0.185, pzc); pBnC.push(BCN_COLORS[1]);
                pBcn.push(pxc, PH + 0.22, pzc); pBnC.push(BCN_COLORS[2]);
            } else if (ch === 'C') {
                // 網狀圍欄：單面鋼絲＋只留「有網那一側」支柱；角落格雙面鋼絲＝轉角連續相接
                const cw = A_PITCH_X * 0.94, cd = A_PITCH_Z * 0.94, chz = CAGE_H / 2;
                const hRun = (A_GRID[r][c - 1] === 'C') || (A_GRID[r][c + 1] === 'C');
                const vRun = (((A_GRID[r - 1] || ' ')[c]) === 'C') || (((A_GRID[r + 1] || ' ')[c]) === 'C');
                const corner = vRun && hRun;
                // 支柱：只在有鋼絲那一側；角落雙面→四角全留
                (corner
                    ? [[-cw / 2, -cd / 2], [cw / 2, -cd / 2], [-cw / 2, cd / 2], [cw / 2, cd / 2]]
                    : vRun
                        ? [[cw / 2, -cd / 2], [cw / 2, cd / 2]]                       // 豎向→+x 側（朝東辦公室）
                        : [[-cw / 2, -cd / 2], [cw / 2, -cd / 2]]                     // 橫向/單格→-z 側（朝倉內上方）
                ).forEach(pt => cagePost.push(wx + pt[0], chz, wz + pt[1]));
                // 鋼絲面：橫向/單格→-z、豎向→+x；角落同時畫兩面＝L 轉角無缺口
                if (vRun) {                                                        // 豎向面（+x 側）
                    for (let i = -4; i <= 4; i++) { const vz = wz + i * (cd / 9); cageEnds.push(wx + cw / 2, 0, vz, wx + cw / 2, CAGE_H, vz); }
                    for (let i = 0; i <= 9; i++) { const yy = (i / 9) * CAGE_H; cageEnds.push(wx + cw / 2, yy, wz - cd / 2, wx + cw / 2, yy, wz + cd / 2); }
                }
                if (corner || !vRun) {                                             // 橫向面（-z 側）
                    for (let i = -4; i <= 4; i++) { const vx = wx + i * (cw / 9); cageEnds.push(vx, 0, wz - cd / 2, vx, CAGE_H, wz - cd / 2); }
                    for (let i = 0; i <= 9; i++) { const yy = (i / 9) * CAGE_H; cageEnds.push(wx - cw / 2, yy, wz - cd / 2, wx + cw / 2, yy, wz - cd / 2); }
                }
            }
            const lbl = A_LABEL_MAP[r + '_' + c];
            if (lbl && ch !== ' ') {
                const spr = makeLabelSprite(lbl, ch === 'R' ? '#bcd7ec' : '#ffd98e', 1.0, 0.22);
                const yy2 = ch === 'R' ? ((/^IC/i.test(lbl) ? 6 : 5) * LV_H) + 0.2 : 1.42;
                spr.position.set(wx, yy2, wz);
                awnGroup.add(spr);
                // ===== 綁定即時資料：透明點擊盒＋狀態色塊＋cellMeshes/entry 註冊（核心 selectEntry / showTooltip / openLocModal 通用 contract） =====
                registerACell({ r: r, c: c, lbl: lbl, ch: ch, wx: wx, wz: wz, yy2: yy2, spr: spr });
            }
        }
    }
    // W 柱子轉 instance：每段一根大柱，footprint ≥4 格（寬/深＝段格數×PITCH，方形）
    const pillarRects = [];   // 柱中心＋邊長（電箱貼柱面用）
    for (let i = 0; i < W_RUNS.length; i++) {
        const w = W_RUNS[i], cc = (w.c0 + w.c1) / 2;
        const wxc = (cc - halfX) * A_PITCH_X, wzc = (w.r - halfZ) * A_PITCH_Z;
        const cellN = Math.max(2, (w.c1 - w.c0 + 1));   // 柱縮小：至少 2 格
        const side = cellN * A_PITCH_X;
        pColW.push(wxc, A_WH / 2, wzc);
        pColWS.push(side, A_WH, side);
        pillarRects.push({ cx: wxc, cz: wzc, side: side });
    }
    // ===== 角落鐵籠缺口＝小門（(r18,c70) 空檔處，接通兩段鐵籠） =====
    (function cageDoor() {
        const rr = 18, cc = 70;                               // 缺口格（row18 col70）
        const gx = (cc - halfX) * A_PITCH_X, gz = (rr - halfZ) * A_PITCH_Z;
        const DH = CAGE_H;                                     // 門高＝籠高（局部）
        const dz = -A_PITCH_Z * 0.46;                          // 貼「上面(-z)」緣：與 row18 欄網面（-z 側）齊平，即可合上
        [ -0.34, 0.34 ].forEach(ox => {                       // 門框兩柱（貼上緣面）
            const po = new THREE.Mesh(new THREE.BoxGeometry(0.07, DH, 0.07), matCageSteel);
            po.position.set(gx + ox, DH / 2, gz + dz); awnGroup.add(po);
        });
        const top = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.07, 0.07), matCageSteel);   // 頂楣
        top.position.set(gx, DH - 0.18, gz + dz); awnGroup.add(top);
        const mid = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.05, 0.05), matCageSteel);    // 橫樑
        mid.position.set(gx, DH * 0.62, gz + dz); awnGroup.add(mid);
        const leaf = new THREE.Mesh(                            // 半透門葉（下方留通道口）
            new THREE.BoxGeometry(0.66, DH * 0.48, 0.035),
            new THREE.MeshLambertMaterial({ color: 0x8a5a36, transparent: true, opacity: 0.55 })
        );
        leaf.position.set(gx, DH * 0.24 + DH * 0.24, gz + dz - 0.02); awnGroup.add(leaf);
        const handle = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.12, 0.02), matCageSteel); // 把手
        handle.position.set(gx - 0.27, DH * 0.24 + DH * 0.24 - 0.02, gz + dz + 0.02); awnGroup.add(handle);
    })();
    // ===== 設施：簡化方塊＋名稱立牌（辦公區＝辦公桌組；電箱＝黑色金屬櫃） =====
    const pDesk = [], pLeg = [], pTower = [], pMon = [], pMonY = [], pKb = [], pMouse = [];
    const pChS = [], pChB = [], pChP = [], pChBa = [];      // 辦公椅：椅面/椅背/氣壓桿/底盤
    const matChS = new THREE.MeshLambertMaterial({ color: 0x2f4b66 });    // 深藍座墊
    const matChB = new THREE.MeshLambertMaterial({ color: 0x22303f });    // 深藍椅背
    const matChM = new THREE.MeshLambertMaterial({ color: 0x8a959e });    // 金屬桿
    const matDeskT = new THREE.MeshLambertMaterial({ color: 0xb98a5f });
    const matDeskL = new THREE.MeshLambertMaterial({ color: 0x5b4637 });
    const matTower  = new THREE.MeshLambertMaterial({ color: 0x2e3137 });
    const matMon    = new THREE.MeshLambertMaterial({ color: 0x171a1e });
    const matKbm    = new THREE.MeshLambertMaterial({ color: 0x33363b });
    const matCab    = new THREE.MeshLambertMaterial({ color: 0x23262b });   // 黑色金屬櫃
    // 電箱金屬/細節材質
    const matCabM    = new THREE.MeshStandardMaterial({ color: 0x2a3035, metalness: 0.85, roughness: 0.32 });  // 櫃體金屬
    const matDoorM   = new THREE.MeshStandardMaterial({ color: 0x383f46, metalness: 0.75, roughness: 0.42 });  // 櫃門板
    const matGryM    = new THREE.MeshStandardMaterial({ color: 0x8a929c, metalness: 0.9,  roughness: 0.3  });  // 電閘/五金
    const matRedM    = new THREE.MeshStandardMaterial({ color: 0xb33520, metalness: 0.3,  roughness: 0.5  });  // 把柄/斷路器紅鈕
    const matMeterM  = new THREE.MeshStandardMaterial({ color: 0xd8d9da, metalness: 0.2,  roughness: 0.5  });  // 電錶座
    const matGlassMb = new THREE.MeshBasicMaterial({ color: 0x11161c, transparent: true, opacity: 0.75 });       // 電錶玻璃
    const matPipeM   = new THREE.MeshStandardMaterial({ color: 0x9aa4ad, metalness: 0.7,  roughness: 0.35 });  // 電線管
    const matYelM    = new THREE.MeshBasicMaterial({ color: 0xe0b325 });                                         // 警示貼紙
    const matGreenM  = new THREE.MeshStandardMaterial({ color: 0x35c25a, metalness: 0.3, roughness: 0.5 });      // 指示燈（綠）
    const boltTex = (() => {                                                                                       // 黃底⚡帶電警示
        const cv = document.createElement('canvas'); cv.width = 96; cv.height = 72;
        const cx = cv.getContext('2d');
        cx.fillStyle = '#f2c11d'; cx.fillRect(0, 0, 96, 72);
        cx.strokeStyle = '#15181c'; cx.lineWidth = 4; cx.strokeRect(2, 2, 92, 68);
        cx.fillStyle = '#15181c';
        cx.beginPath();
        cx.moveTo(57, 2); cx.lineTo(28, 42); cx.lineTo(43, 42); cx.lineTo(32, 70); cx.lineTo(70, 28); cx.lineTo(53, 28); cx.closePath();
        cx.fill();
        const t = new THREE.CanvasTexture(cv);
        t.magFilter = THREE.LinearFilter; t.minFilter = THREE.LinearFilter;
        return t;
    })();
    let pdBuilt = false;   // 配電室只蓋一次（主塊）
    for (let fi = 0; fi < A_FACILITIES.length; fi++) {
        const fc = A_FACILITIES[fi];
        const fcx = (((fc.x0 + fc.x1) / 2) - halfX) * A_PITCH_X;
        const fcz = (((fc.z0 + fc.z1) / 2) - halfZ) * A_PITCH_Z;
        const fw = (fc.x1 - fc.x0 + 1) * A_PITCH_X * 0.98;
        const fd = (fc.z1 - fc.z0 + 1) * A_PITCH_Z * 0.98;
        const fmat = new THREE.MeshLambertMaterial({ color: fc.color });
        const fs = makeLabelSprite(fc.label, '#eaffff', 1.3, 0.2);
        fs.position.set(fcx, 2.7, fcz); awnGroup.add(fs);
        if (fc.label.indexOf('配電室') >= 0 || fc.label.indexOf('配电室') >= 0) {
            // 配電室：小房間（四面實牆到柱高、不封頂、南牆留門）、內部靠牆放滿配電櫃
            if (!pdBuilt) {
                pdBuilt = true;
                const X0 = (0 - halfX) * A_PITCH_X - A_PITCH_X / 2;    // col0
                const X1 = (13 - halfX) * A_PITCH_X + A_PITCH_X / 2;   // col13
                const Z0 = (38 - halfZ) * A_PITCH_Z - A_PITCH_Z / 2;   // row38（北）
                const Z1 = (40 - halfZ) * A_PITCH_Z + A_PITCH_Z / 2;   // row40（南）
                const H = A_WH, W = 0.12;                              // 牆厚
                const dL = (6 - halfX) * A_PITCH_X, dR = (8 - halfX) * A_PITCH_X + A_PITCH_X;   // 門洞（c6..c8）
                const dC = (dL + dR) / 2, dWdt = dR - dL, dH = 2.4;    // 門寬/高（局部）
                const wMatP = new THREE.MeshLambertMaterial({ color: 0xcfd5db });   // 實牆
                const midX = (X0 + X1) / 2, midZ = (Z0 + Z1) / 2;
                function wallP(x, z, len, alongX) {
                    const g = new THREE.Mesh(alongX ? new THREE.BoxGeometry(len, H, W) : new THREE.BoxGeometry(W, H, len), wMatP);
                    g.position.set(x, H / 2, z); awnGroup.add(g);
                }
                // 地板（中灰混凝土）
                const flrP = new THREE.Mesh(new THREE.BoxGeometry(X1 - X0, 0.12, Z1 - Z0),
                    new THREE.MeshLambertMaterial({ color: 0x8a9199 }));
                flrP.position.set(midX, 0.06, midZ); awnGroup.add(flrP);
                wallP(midX, Z1, X1 - X0, true);   // 南牆閉合（門改北牆朝鐵籠）                                   // 北牆
                wallP(X0, midZ, Z1 - Z0, false);                                  // 西牆
                wallP(X1, midZ, Z1 - Z0, false);                                  // 東牆
                if (dL - X0 > 0.05) wallP((X0 + dL) / 2, Z0, dL - X0, true);   // 北牆左段      // 南牆西段
                if (X1 - dR > 0.05) wallP((dR + X1) / 2, Z0, X1 - dR, true);   // 北牆右段      // 南牆東段
                const hd = new THREE.Mesh(new THREE.BoxGeometry(dWdt, H - dH, W), wMatP);   // 門洞上方補牆
                hd.position.set(dC, (H + dH) / 2, Z0); awnGroup.add(hd);   // 門洞上方補牆（北牆）
                // 配電櫃（靠內牆擺滿、面向室內）
                const cabM = new THREE.MeshLambertMaterial({ color: 0x23262b });
                const cabF = new THREE.MeshLambertMaterial({ color: 0x3a4149 });
                const cabHl = new THREE.MeshLambertMaterial({ color: 0x8a929c });
                const cabL = new THREE.MeshBasicMaterial({ color: 0x3ddc4e });
                function esdCab(x, z, faceX) {   // faceX:+1 面朝+x、-1 面朝-x、0 面朝+z
                    const g = new THREE.Group();
                    const body = new THREE.Mesh(new THREE.BoxGeometry(0.66, 1.7, 0.34), cabM);
                    g.add(body);
                    const door = new THREE.Mesh(new THREE.BoxGeometry(0.62, 1.5, 0.02), cabF);
                    door.position.set(0, 0.12, 0.18); g.add(door);
                    const rk = new THREE.Mesh(new THREE.BoxGeometry(0.02, 1.4, 0.05), cabHl);   // 把手溝
                    rk.position.set(0, 0.12, 0.2); g.add(rk);
                    const bm = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.18, 0.04), cabHl); // 儀表
                    bm.position.set(-0.16, 0.78, 0.2); g.add(bm);
                    const bt = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.2, 0.05), cabM);    // 電閘排
                    bt.position.set(0.06, -0.1, 0.21); g.add(bt);
                    const l1 = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 8), cabL);
                    l1.position.set(0.28, 0.86, 0.22); g.add(l1);
                    g.position.set(x, 0.85, z);
                    if (faceX === 1) g.rotation.y = Math.PI / 2;
                    else if (faceX === -1) g.rotation.y = -Math.PI / 2;
                    else if (faceX === 2) g.rotation.y = Math.PI;   // 朝 -z 北（安裝在南牆、正面朝北入室）
                    awnGroup.add(g);
                }
                // 室內設備「往南靠」：南牆一整排配電櫃（正面朝北入室）
                const nS = Math.max(4, Math.floor((X1 - X0 - 1.2) / 0.7));
                for (let i = 0; i < nS; i++) esdCab(X0 + 0.55 + i * ((X1 - X0 - 1.1) / nS), Z1 - 0.5, 2);
                // 黑箱子「靠北牆」：門洞兩側沿牆排
                const cabBox = new THREE.MeshLambertMaterial({ color: 0x1c2024 });
                const dCx = (dL + dR) / 2;
                const nBox = Math.max(6, Math.floor((X1 - X0 - 1.2) / 0.65));
                for (let i = 0; i < nBox; i++) {
                    const bx = X0 + 0.55 + i * ((X1 - X0 - 1.0) / nBox);
                    if (Math.abs(bx - dCx) < 1.0) continue;                       // 讓開門洞
                    const bo = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.16, 0.30), cabBox);
                    bo.position.set(bx, 0.08, Z0 + 0.28); awnGroup.add(bo);
                }
            }
            continue;   // 不畫泛用色塊
        }
        if (fc.label.indexOf('X-Ray') >= 0 || fc.label.indexOf('X光') >= 0 || fc.label.indexOf('Xray') >= 0) {
            // X-Ray 獨立小房間：四牆各＝下實牆(0..1.2m)＋玻璃帶(1.2..1.8m)＋上實牆(1.8..柱高4.5m)、西牆封閉無門、不封頂
            const X0 = (fc.x0 - halfX) * A_PITCH_X - A_PITCH_X / 2;
            const X1 = (fc.x1 - halfX) * A_PITCH_X + A_PITCH_X / 2;
            const Z0 = (fc.z0 - halfZ) * A_PITCH_Z - A_PITCH_Z / 2;
            const Z1 = (fc.z1 - halfZ) * A_PITCH_Z + A_PITCH_Z / 2;
            const WT = 0.12, HS = 0.8, HG = 0.4, HT = A_WH - (HS + HG);   // 上實牆＝到柱高 A_WH(3.0)
            const wMatR = new THREE.MeshLambertMaterial({ color: 0xd5dae0, transparent: true, opacity: 0.30, depthWrite: false });   // 實牆透明化（可透視房內）
            const gMatR = new THREE.MeshLambertMaterial({ color: 0xbfe6ff, transparent: true, opacity: 0.28, side: THREE.DoubleSide, depthWrite: false });   // 玻璃
            function wallRR(x, z, len, alongX) {
                for (let sg = 0; sg < 3; sg++) {
                    const hgt = sg === 0 ? HS : (sg === 1 ? HG : HT);
                    const yy = sg === 0 ? HS / 2 : (sg === 1 ? HS + HG / 2 : HS + HG + HT / 2);
                    const g = new THREE.Mesh(
                        alongX ? new THREE.BoxGeometry(len, hgt, WT) : new THREE.BoxGeometry(WT, hgt, len),
                        sg === 1 ? gMatR : wMatR
                    );
                    g.position.set(x, yy, z);
                    awnGroup.add(g);
                }
            }
            const flr = new THREE.Mesh(new THREE.BoxGeometry(X1 - X0, 0.12, Z1 - Z0), new THREE.MeshLambertMaterial({ color: 0x8f969e }));   // 地板＝中灰混凝土（不會像白的）
            flr.position.set((X0 + X1) / 2, 0.06, (Z0 + Z1) / 2); awnGroup.add(flr);
            wallRR((X0 + X1) / 2, Z1 + WT / 2, (X1 - X0) + WT, true);   // 南牆
            wallRR((X0 + X1) / 2, Z0 - WT / 2, (X1 - X0) + WT, true);   // 北牆
            wallRR(X1 + WT / 2, (Z0 + Z1) / 2, (Z1 - Z0) + WT, false);  // 東牆
            // 西牆：保留門洞出入口（0.9×1.4 局部＝世界 1.35×2.1m），洞上方補實牆到柱高（不留原門框）
            const zDc = (19 - halfZ) * A_PITCH_Z, WD = 0.9, OD = 1.4;
            if (zDc - WD / 2 - Z0 > 0.01) wallRR(X0 - WT / 2, (Z0 + (zDc - WD / 2)) / 2, (zDc - WD / 2) - Z0, false);   // 左段
            if (Z1 - (zDc + WD / 2) > 0.01) wallRR(X0 - WT / 2, ((zDc + WD / 2) + Z1) / 2, Z1 - (zDc + WD / 2), false);  // 右段
            const headH = A_WH - OD;                                                                                    // 洞上方→柱高 全實牆
            const headW = new THREE.Mesh(new THREE.BoxGeometry(WT, headH, WD), wMatR);
            headW.position.set(X0 - WT / 2, OD + headH / 2, zDc); awnGroup.add(headW);
            continue;
        }
        if (fc.label.indexOf('電箱') >= 0) {                 // 電箱＝金屬配電櫃＋正面電閘/電錶/電線管：貼最近柱子一面
            function buildCabinet(w, h, d) {                 // 本地 +z = 正面（朝外）；配電細節鋪滿 ~80% 門面
                const g = new THREE.Group();
                g.add(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), matCabM));
                const dg = new THREE.Group();
                dg.position.z = d / 2 + 0.02;                                                          // 貼櫃正面
                dg.add(new THREE.Mesh(new THREE.BoxGeometry(w * 0.86, h * 0.98, 0.012), matDoorM));   // 櫃門板（大）
                // 上排：2 顆電錶（白座＋玻璃窗）
                [[-w * 0.16, 0.30], [w * 0.16, 0.30]].forEach(mt => {
                    const f = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.24, 0.05), matMeterM);
                    f.position.set(mt[0], mt[1], 0.05); dg.add(f);
                    const fg = new THREE.Mesh(new THREE.BoxGeometry(0.27, 0.17, 0.014), matGlassMb);
                    fg.position.set(mt[0], mt[1], 0.076); dg.add(fg);
                });
                // 中排：4 顆電閘（灰座＋紅把柄＋黃名牌）
                [-0.42, -0.14, 0.14, 0.42].forEach(ax => {
                    const sw = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.30, 0.05), matGryM);
                    sw.position.set(ax, -0.02, 0.05); dg.add(sw);
                    const lv = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.16, 0.03), matRedM);
                    lv.position.set(ax, -0.02, 0.09); dg.add(lv);
                    const lb = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.035, 0.018), matYelM);
                    lb.position.set(ax, 0.16, 0.062); dg.add(lb);
                });
                // 下排：6 顆斷路器＋紅鈕
                [-0.45, -0.27, -0.09, 0.09, 0.27, 0.45].forEach(ax => {
                    const cb = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.18, 0.04), matGryM);
                    cb.position.set(ax, -0.34, 0.055); dg.add(cb);
                    const nub = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.05, 0.02), matRedM);
                    nub.position.set(ax, -0.34, 0.085); dg.add(nub);
                });
                // 左側燈號（紅/綠/紅 3 顆）
                [0, 1, 2].forEach(i => {
                    const lam = new THREE.Mesh(new THREE.SphereGeometry(0.022, 10, 10), i === 1 ? matGreenM : matRedM);
                    lam.position.set(-w / 2 + 0.15, 0.36 - i * 0.115, 0.07); dg.add(lam);
                });
                // 右上角：大張黃底 ⚡ 帶電警示貼紙（放在電錶上方，避開電錶/電閘不穿模）
                const pl = new THREE.Mesh(
                    new THREE.PlaneGeometry(Math.min(w * 0.34, 0.5), Math.min(h * 0.15, 0.22)),
                    new THREE.MeshBasicMaterial({ map: boltTex })
                );
                pl.position.set(w / 2 - 0.26, 0.52, 0.064); dg.add(pl);
                g.add(dg);
                // 電線管（沿柱下到地面）
                const pipe = new THREE.Mesh(new THREE.BoxGeometry(0.045, h + 1.7, 0.045), matPipeM);
                pipe.position.set(-w / 2 + 0.08, -h / 2 - 0.45, 0); g.add(pipe);
                return g;
            }
            let bp = null, bd = 1e9;
            for (let pi = 0; pi < pillarRects.length; pi++) {
                const pl = pillarRects[pi];
                const dd = (pl.cx - fcx) * (pl.cx - fcx) + (pl.cz - fcz) * (pl.cz - fcz);
                if (dd < bd) { bd = dd; bp = pl; }
            }
            if (bp && bd < 900) {
                const side = bp.side, pcx = bp.cx, pcz = bp.cz;
                const wallX = Math.abs(fcx - pcx) >= Math.abs(fcz - pcz);   // true: 貼柱 x 面；false: 貼柱 z 面
                const wCab = Math.min(wallX ? fd : fw, side * 0.9);         // 寬度≤柱寬
                const g = buildCabinet(wCab, 1.2, 0.3);
                const dirX = wallX ? (fcx >= pcx ? 1 : -1) : 0;
                const dirZ = wallX ? 0 : (fcz >= pcz ? 1 : -1);
                g.rotation.y = wallX ? (dirX === 1 ? Math.PI / 2 : -Math.PI / 2) : (dirZ === 1 ? 0 : Math.PI);
                if (wallX) g.position.set(pcx + dirX * (side / 2 + 0.15), 0.6, pcz);
                else g.position.set(pcx, 0.6, pcz + dirZ * (side / 2 + 0.15));
                awnGroup.add(g);
            } else {
                const g = buildCabinet(Math.min(fw, 1.0), 1.2, Math.min(fd, 0.6));
                g.position.set(fcx, 0.6, fcz); awnGroup.add(g);
            }
            continue;
        }
        if (fc.label.indexOf('出庫') >= 0) {                  // 出庫區：3 組辦公設備（桌/螢幕/主機/鍵盤/滑鼠/椅）
            const fb0 = new THREE.Mesh(new THREE.BoxGeometry(fw, 0.06, fd), fmat);
            fb0.position.set(fcx, 0.03, fcz); awnGroup.add(fb0);
            for (let k = 0; k < 3; k++) {
                const dxp = fcx - fw / 2 + (k * 2 + 1) * (fw / 6);   // 三等分橫向
                const dzp = fcz;
                pDesk.push(dxp, 0.70, dzp);
                [[dxp - 0.68, dzp - 0.30], [dxp + 0.68, dzp - 0.30], [dxp - 0.68, dzp + 0.30], [dxp + 0.68, dzp + 0.30]].forEach(pp2 => pLeg.push(pp2[0], 0.35, pp2[1]));
                pTower.push(dxp - 0.74, 0.30, dzp);
                pMon.push(dxp, 0.88, dzp + 0.20); pMonY.push(0);
                pKb.push(dxp, 0.75, dzp - 0.14);
                pMouse.push(dxp + 0.24, 0.75, dzp - 0.30);
                pChS.push(dxp, 0.45, dzp - 0.48);
                pChB.push(dxp, 0.66, dzp - 0.48 - 0.21);
                pChP.push(dxp, 0.24, dzp - 0.48);
                pChBa.push(dxp, 0.035, dzp - 0.48);
            }
            continue;
        }
        if (fc.label.indexOf('辦公') >= 0 || fc.label.indexOf('办公室') >= 0) {   // 辦公區＝辦公桌組
            const fb = new THREE.Mesh(new THREE.BoxGeometry(fw, 0.06, fd), fmat);   // 薄地板
            fb.position.set(fcx, 0.03, fcz); awnGroup.add(fb);
            const nX = Math.max(1, Math.floor(fw / 2.1));   // 桌列
            const nZ = Math.max(1, Math.floor(fd / 2.4));   // 桌排
            for (let ix = 0; ix < nX; ix++) for (let iz = 0; iz < nZ; iz++) {
                const dxp = fcx - fw / 2 + (ix + 0.5) * (fw / nX);
                const dzp = fcz - fd / 2 + (iz + 0.5) * (fd / nZ);
                pDesk.push(dxp, 0.70, dzp);
                [[dxp - 0.68, dzp - 0.30], [dxp + 0.68, dzp - 0.30], [dxp - 0.68, dzp + 0.30], [dxp + 0.68, dzp + 0.30]].forEach(pp => pLeg.push(pp[0], 0.35, pp[1]));
                pTower.push(dxp - 0.74, 0.30, dzp);         // 電腦主機在桌下（左側）
                pMon.push(dxp, 0.88, dzp + 0.20); pMonY.push(0);           // 顯示器在桌上（偏後）
                pKb.push(dxp, 0.75, dzp - 0.14);            // 鍵盤在顯示器前
                pMouse.push(dxp + 0.24, 0.75, dzp - 0.30);  // 滑鼠更前
                pChS.push(dxp, 0.45, dzp - 0.48);           // 椅子：座墊（桌前方，面向顯示器）
                pChB.push(dxp, 0.66, dzp - 0.48 - 0.21);    // 椅背（座墊後方）
                pChP.push(dxp, 0.24, dzp - 0.48);           // 氣壓桿
                pChBa.push(dxp, 0.035, dzp - 0.48);         // 五腳底盤（簡化圓盤）
            }
            continue;
        }
        if (fc.label.indexOf('拼接區域') >= 0) {                 // 拼接機 N 台＋每台右側綠桌＋防靜電箱
            const mm = /(\d+)\s*台/.exec(fc.label);
            const nM = mm ? parseInt(mm[1], 10) : 1;
            const step = fw / nM;
            for (let mi = 0; mi < nM; mi++) {
                const mx = fcx - fw / 2 + step * (mi + 0.5);
                buildSplicer(mx, fcz);
                buildEsdTable(mx + 0.52, fcz);
            }
            continue;
        }
        if (fc.label.indexOf('分料区') >= 0 || fc.label.indexOf('分料區') >= 0) {
            // 分料區：桌子＋棧板＋防靜電箱 隨意擺（偽隨機、每次刷新位置固定）
            const sd = (fc.x0 * 131 + fc.x1 * 17 + fc.z0 * 7 + fc.z1 * 3) >>> 0;
            let _rv = sd;
            const rv = () => { _rv = (_rv * 1103515245 + 12345) & 0x7fffffff; return _rv / 0x7fffffff; };
            const mkDesk = (x, z, ry) => {   // 木桌（4 腳）
                const g = new THREE.Group();
                const top = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.05, 0.5), woodBaseMat);
                top.position.y = 0.72; g.add(top);
                [[-0.40, -0.21], [0.40, -0.21], [-0.40, 0.21], [0.40, 0.21]].forEach(ft => {
                    const lg = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.70, 0.05), woodBaseMat);
                    lg.position.set(ft[0], 0.35, ft[1]); g.add(lg);
                });
                g.position.set(x, 0, z); g.rotation.y = ry; awnGroup.add(g);
            };
            const mkPallet = (x, z, ry) => {   // 棧板（三枕木）
                const g = new THREE.Group();
                const top = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.03, 0.5), woodBaseMat);
                top.position.y = 0.075; g.add(top);
                [-0.2, 0, 0.2].forEach(ox => {
                    const st = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.06, 0.45), woodBaseMat);
                    st.position.set(ox, 0.03, 0); g.add(st);
                });
                g.position.set(x, 0, z); g.rotation.y = ry; awnGroup.add(g);
            };
            const mkEsd = (x, z, ry) => {   // 防靜電黑箱
                const g = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.07, 0.10),
                    new THREE.MeshLambertMaterial({ color: 0x181b1f }));
                g.position.set(x, 0.035, z); g.rotation.y = ry; awnGroup.add(g);
            };
            for (let i = 0; i < 4; i++) mkDesk(fcx + (rv() - 0.5) * fw * 0.8, fcz + (rv() - 0.5) * fd * 0.7, (rv() - 0.5) * 0.6);
            for (let i = 0; i < 6; i++) mkPallet(fcx + (rv() - 0.5) * fw * 0.8, fcz + (rv() - 0.5) * fd * 0.7, (rv() - 0.5) * 0.5);
            for (let i = 0; i < 8; i++) mkEsd(fcx + (rv() - 0.5) * fw * 0.85, fcz + (rv() - 0.5) * fd * 0.75, rv() * Math.PI);
            continue;
        }

        if (fc.label.indexOf('空荡区') >= 0 || fc.label.indexOf('空蕩區') >= 0) {
            // 空蕩區：短斜紋（45° 斷線）密集蓋滿整區、不超出區域
            const cx0 = fcx - fw / 2 + 0.25, cz0 = fcz - fd / 2 + 0.25;
            const hL = 0.16, gap = 0.62, y = 0.012;
            const matK = new THREE.MeshLambertMaterial({ color: 0x9aa0a8, transparent: true, opacity: 0.85 });
            for (let px = cx0; px < cx0 + fw - 0.5; px += gap) {
                for (let pz = cz0; pz < cz0 + fd - 0.5; pz += gap) {
                    const bm = new THREE.Mesh(new THREE.BoxGeometry(hL * 2, 0.016, 0.03), matK);
                    bm.position.set(px, y, pz);
                    bm.rotation.y = Math.PI / 4;
                    awnGroup.add(bm);
                }
            }
            continue;
        }

        if (/天車[區区]|看板|X-?Ray|X-?RAY/i.test(fc.label)) continue;   // 已有實體（天車帶/電視牆/X-Ray 室），不畫色塊地面
        const fb2 = new THREE.Mesh(new THREE.BoxGeometry(fw, 0.24, fd), fmat);
        fb2.position.set(fcx, 0.12, fcz); awnGroup.add(fb2);
    }
    // ===== 生產看板：一排 3 台 55 吋電視（生產/出入庫/庫存）＝掛柱式、面朝天車區（西 −x）、無底座 =====
    function makeDataScreen(caption, colr) {
        const cv = document.createElement('canvas'); cv.width = 640; cv.height = 360;
        const ctx = cv.getContext('2d');
        ctx.fillStyle = '#0c1219'; ctx.fillRect(0, 0, 640, 360);
        ctx.fillStyle = colr; ctx.fillRect(0, 0, 640, 60);
        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 36px "Microsoft JhengHei",sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(caption, 320, 42);
        ctx.font = '22px "Microsoft JhengHei",sans-serif'; ctx.fillStyle = 'rgba(255,255,255,.75)';
        ctx.fillText('LIVE 即時更新', 320, 84);
        for (let i = 0; i < 5; i++) {
            const yy = 130 + i * 46;
            ctx.strokeStyle = 'rgba(255,255,255,.16)'; ctx.beginPath(); ctx.moveTo(20, yy); ctx.lineTo(620, yy); ctx.stroke();
            ctx.fillStyle = '#ffd866'; ctx.fillText('項目 0' + (i + 1), 90, yy - 14);
            ctx.fillStyle = colr;
            ctx.fillRect(170, yy - 22, (140 + ((i * 47) % 230)), 14);
            ctx.fillStyle = '#e8eef4'; ctx.fillText(String(1000 + ((i * 137) % 8999)), 560, yy - 14);
        }
        const t = new THREE.CanvasTexture(cv);
        t.magFilter = THREE.LinearFilter; t.minFilter = THREE.LinearFilter;
        return t;
    }
    const tc = 90, trBase = 35;                                      // 電視牆：欄 90、由列 35 往南排三台
    const colX = (tc - halfX) * A_PITCH_X;
    const spineZ = ((trBase + 1) - halfZ) * A_PITCH_Z;
    const tvSpecs = [
        { caption: '生產數據',   color: '#25c3ba' },
        { caption: '出入庫數據', color: '#3f8de0' },
        { caption: '庫存數據',   color: '#39c25a' }
    ];
    for (let tv = 0; tv < tvSpecs.length; tv++) {
        const sp = tvSpecs[tv];
        const TVN = tvSpecs.length;                                                       // 3 台＝連成一排（三宮格）
        const gz0 = ((trBase + (TVN - 1) / 2) - halfZ) * A_PITCH_Z + (tv - (TVN - 1) / 2) * 1.68;   // 連著放：機框 1.68 首尾相貼
        const frame = new THREE.Mesh(new THREE.BoxGeometry(1.68, 0.94, 0.07), matCabM);   // 黑色金屬機框（長寬×2）
        frame.rotation.y = -Math.PI / 2;                                                    // 機框也轉 90°：平面與螢幕同向（−x）
        frame.position.set(colX, 1.55, gz0); awnGroup.add(frame);
        const screen = new THREE.Mesh(
            new THREE.PlaneGeometry(1.44, 0.76),
            new THREE.MeshBasicMaterial({ map: makeDataScreen(sp.caption, sp.color), side: THREE.DoubleSide })
        );
        screen.position.set(colX - 0.045, 1.55, gz0); screen.rotation.y = -Math.PI / 2;   // 面朝天車區（−x）
        awnGroup.add(screen);

    }

    // ===== X-Ray 點料機：依參考圖（前視 1200×1650 / 側視 850 / 俯視 900）3 台放房間內 =====
    (function xrayMachines() {
        // 世界 mm → 局部（awnGroup scale1.5）：1200→0.8、850→0.5667、1650→1.10
        const MW = 0.8, MD = 0.5667, MH = 1.10;
        function buildXray() {
            const g = new THREE.Group();
            // 拉絲灰金屬紋（機身）
            const cv2 = document.createElement('canvas'); cv2.width = 256; cv2.height = 64;
            const c2 = cv2.getContext('2d'); c2.fillStyle = '#c6cdd5'; c2.fillRect(0, 0, 256, 64);
            for (let i = 0; i < 240; i++) { c2.fillStyle = 'rgba(255,255,255,' + (Math.random() * 0.10) + ')'; c2.fillRect(0, i * 0.27, 256, 1); }
            const mBodyT = new THREE.MeshStandardMaterial({ map: new THREE.CanvasTexture(cv2), color: 0xd8dde3, metalness: .85, roughness: .34 });
            const mDark  = new THREE.MeshStandardMaterial({ color: 0x2a2e33, metalness: .5, roughness: .4 });
            const mDoor  = new THREE.MeshStandardMaterial({ color: 0x9aa4ad, metalness: .7, roughness: .3 });
            const mGlass = new THREE.MeshStandardMaterial({ color: 0x8fd9ff, transparent: true, opacity: .28, metalness: .9, roughness: .05, depthWrite: false });
            const mBlack = new THREE.MeshStandardMaterial({ color: 0x15171a, metalness: .2, roughness: .6 });
            const mInLight = new THREE.MeshStandardMaterial({ color: 0x24c05e, emissive: 0x1b8f44, emissiveIntensity: .55 });
            // 螢幕 UI 貼圖
            const cv = document.createElement('canvas'); cv.width = 480; cv.height = 320;
            const c = cv.getContext('2d');
            c.fillStyle = '#0b1e2a'; c.fillRect(0, 0, 480, 320);
            c.fillStyle = '#22c7ff'; c.font = 'bold 28px sans-serif'; c.fillText('X-RAY 系統', 22, 46);
            c.font = '18px monospace'; c.fillStyle = '#39ff77';
            for (let i = 0; i < 8; i++) { c.fillRect(22, 86 + i * 29, 430 - ((i * 47) % 80), 9); }
            const mUI = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv) });
            const mk = (geo, mat, x, y, z, rx) => { const o = new THREE.Mesh(geo, mat); o.position.set(x, y, z); if (rx) o.rotation.x = rx; g.add(o); return o; };
            mk(new THREE.BoxGeometry(MW, MH, MD), mBodyT, 0, MH / 2, 0);                     // 機身
            mk(new THREE.BoxGeometry(0.40, 0.267, 0.030), mBlack, 0, MH - 0.34, MD / 2 + 0.018);  // 螢幕框
            mk(new THREE.PlaneGeometry(0.36, 0.24), mUI, 0, MH - 0.34, MD / 2 + 0.038);      // 螢幕 UI
            mk(new THREE.BoxGeometry(0.333, 0.333, 0.013), mDoor, 0, 0.40, MD / 2 + 0.016);  // 門
            mk(new THREE.BoxGeometry(0.17, 0.17, 0.006), mGlass, 0, 0.40, MD / 2 + 0.024);   // 門上小窗
            const slot = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.10, 0.10, 20), mBlack);
            slot.rotation.x = Math.PI / 2; slot.position.set(0, 0.10, MD / 2 + 0.020); g.add(slot);  // 卷盤槽（圓座朝前）
            mk(new THREE.BoxGeometry(0.40, 0.05, 0.012), mDark, 0, 0.16, MD / 2 + 0.017);    // 卷盤槽上蓋板
            [-0.17, 0, 0.17].forEach((xx) => mk(new THREE.SphereGeometry(0.016, 10, 10), mInLight, xx, 0.22, MD / 2 + 0.032));  // 指示燈
            mk(new THREE.CylinderGeometry(0.017, 0.017, 0.016, 12),
               new THREE.MeshStandardMaterial({ color: 0xd42a2a, emissive: 0x9c1717, emissiveIntensity: .7 }), 0.28, 0.22, MD / 2 + 0.022);  // 急停
            mk(new THREE.BoxGeometry(0.013, 0.35, 0.20), mDark, -MW / 2 + 0.008, 0.30, 0);   // 側面散熱孔板
            // 頂部三色燈塔（分三段着色）
            const bp = new THREE.Mesh(new THREE.CylinderGeometry(0.030, 0.030, 0.14, 14), new THREE.MeshStandardMaterial({ color: 0x1d1f24, metalness: .6, roughness: .4 }));
            bp.position.set(0, MH + 0.070, 0); g.add(bp);
            [[0x2b2e33, 0x2b2e33], [0xffe23b, 0x968d16], [0x2bff6b, 0x1a8f3f]].forEach((cc, i) => {
                const seg = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.046, 14),
                    new THREE.MeshStandardMaterial({ color: cc[0], emissive: cc[1], emissiveIntensity: i === 0 ? 0.05 : 0.55 }));
                seg.position.set(0, MH + 0.070 - 0.070 + i * 0.046, 0); g.add(seg);
            });
            [[-0.36, -0.23], [0.36, -0.23], [-0.36, 0.23], [0.36, 0.23]].forEach(pm =>
                mk(new THREE.BoxGeometry(0.033, 0.033, 0.033), mDark, pm[0], 0.0165, pm[1]));   // 4 腳墊
            // ===== 貼三視圖貼圖（lib/X-RAY正面/側面/俯視） =====
            (function () {
                const tl = new THREE.TextureLoader();
                const mF = tl.load('lib/X-RAY正面图.png');
                const mS = tl.load('lib/X-RAY侧面图.png');
                const mT = tl.load('lib/X-RAY俯视图.png');
                const fp = new THREE.Mesh(new THREE.PlaneGeometry(MW, MH), new THREE.MeshBasicMaterial({ map: mF, side: THREE.DoubleSide }));
                fp.position.set(0, MH / 2, MD / 2 + 0.002); g.add(fp);                    // 正面（+z→世界 −x 朝房內）
                const sp = new THREE.Mesh(new THREE.PlaneGeometry(MD, MH), new THREE.MeshBasicMaterial({ map: mS, side: THREE.DoubleSide }));
                sp.rotation.y = Math.PI / 2; sp.position.set(MW / 2 + 0.002, MH / 2, 0); g.add(sp);   // 側面
                const tp = new THREE.Mesh(new THREE.PlaneGeometry(MW, MD), new THREE.MeshBasicMaterial({ map: mT, side: THREE.DoubleSide }));
                tp.rotation.x = -Math.PI / 2; tp.position.set(0, MH + 0.002, 0); g.add(tp);          // 頂面
            })();
            g.frustumCulled = false;
            return g;
        }
        let xr = null;
        for (const fc of A_FACILITIES) if (fc.label.indexOf('X-Ray') >= 0) { xr = fc; break; }
        if (!xr) return;
        const fx = (xr.x1 - halfX) * A_PITCH_X - 0.283 - 0.28;     // 貼東牆內側
        const zz0 = ((xr.z0 + 2) - halfZ) * A_PITCH_Z;             // 前（北）側起（避開 19 列門洞）
        const zz1 = ((xr.z1 - 7) - halfZ) * A_PITCH_Z;
        for (let k = 0; k < 3; k++) {
            const m = buildXray();
            m.position.set(fx, 0, zz0 + (zz1 - zz0) * (k / 2));
            m.rotation.y = -Math.PI / 2;                           // 機身正面（+z）朝西＝朝房間內
            awnGroup.add(m);
        }
        // ===== 西牆內側：一排綠色桌面長桌＋2 台電腦（靠牆；避開 r19 門洞） =====
        {
            const X0w = (xr.x0 - halfX) * A_PITCH_X - A_PITCH_X / 2;   // 西牆內側面（col87 西緣）
            const tDepth = 0.6, tTopY = 0.75;                      // 桌面窄一點（0.9→0.6）
            const zA = (8 - halfZ) * A_PITCH_Z, zB = (18 - halfZ) * A_PITCH_Z;   // r8..r18
            const zC = (zA + zB) / 2, tLen = zB - zA;
            const tx = X0w + tDepth / 2;                            // 貼牆、無縫
            const mGrnTop = new THREE.MeshLambertMaterial({ color: 0x2f9e5f });   // 綠色桌面
            const topS = new THREE.Mesh(new THREE.BoxGeometry(tDepth, 0.06, tLen - 0.2), mGrnTop);
            topS.position.set(tx, tTopY, zC); awnGroup.add(topS);
            for (let z = zA + 0.6; z <= zB - 0.6; z += 2.4) {      // 桌腳（每 2.4 一對）
                pLeg.push(tx - tDepth / 2 + 0.06, tTopY / 2, z);
                pLeg.push(tx + tDepth / 2 - 0.06, tTopY / 2, z);
            }
            [zA + tLen * 0.33, zB - tLen * 0.33].forEach(z => {     // 2 台電腦（沿用 office instanced）
                pMon.push(tx, tTopY + 0.18, z); pMonY.push(fx > tx ? Math.PI / 2 : -Math.PI / 2);   // 螢幕面朝 X-RAY 機器
                pKb.push(tx - 0.05, tTopY + 0.05, z - 0.12);
                pMouse.push(tx + 0.19, tTopY + 0.05, z - 0.24);
                pTower.push(tx - tDepth / 2 - 0.10, 0.25, z - 0.1);
            });
        }
    })();

    // 辦公桌組 instanced
    awnGroup.add(buildInst(new THREE.BoxGeometry(1.50, 0.06, 0.70), matDeskT, pDesk));
    awnGroup.add(buildInst(new THREE.BoxGeometry(0.06, 0.70, 0.06), matDeskL, pLeg));
    awnGroup.add(buildInst(new THREE.BoxGeometry(0.24, 0.50, 0.55), matTower, pTower));
    awnGroup.add(buildInst(new THREE.BoxGeometry(0.55, 0.36, 0.05), matMon, pMon, null, null, pMonY));
    awnGroup.add(buildInst(new THREE.BoxGeometry(0.42, 0.02, 0.14), matKbm, pKb));
    awnGroup.add(buildInst(new THREE.BoxGeometry(0.07, 0.02, 0.10), matKbm, pMouse));
    awnGroup.add(buildInst(new THREE.BoxGeometry(0.44, 0.06, 0.44), matChS, pChS));
    awnGroup.add(buildInst(new THREE.BoxGeometry(0.40, 0.45, 0.06), matChB, pChB));
    awnGroup.add(buildInst(new THREE.BoxGeometry(0.05, 0.30, 0.05), matChM, pChP));
    awnGroup.add(buildInst(new THREE.BoxGeometry(0.34, 0.03, 0.34), matChM, pChBa));

    // ===== 天車補料：傳送帶 → 下方柱子處垂直上頂 → 下放 → 南移離開 A 倉後消失（迴圈） =====
    (function convBelt() {
        const bx = 33.96, bz0 = 17.487, bz1 = 24.313;      // 局部：起點 r35c87(-109.20,-53.77) → 柱位 r40c87(-109.13,-43.53)
        const BL = bz1 - bz0;
        const mBeltD = new THREE.MeshLambertMaterial({ color: 0x23262b });
        const mBeltS = new THREE.MeshLambertMaterial({ color: 0x8a959e });
        // 滾筒帶床面（加高）
        const bed = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.05, BL), mBeltD);
        bed.position.set(bx, 0.20, bz0 + BL / 2); awnGroup.add(bed);
        // 兩側護軌（加高）
        [[-0.25], [0.25]].forEach(sxx => {
            const rail = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.28, BL), mBeltS);
            rail.position.set(bx + sxx[0], 0.28, bz0 + BL / 2); awnGroup.add(rail);
        });
        // 支腿（兩排 4 支，加高）
        for (let k = 0; k < 4; k++) {
            [[-0.20], [0.20]].forEach(sxx => {
                const leg = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.20, 0.05), mBeltS);
                leg.position.set(bx + sxx[0], 0.10, bz0 + (BL * k) / 3); awnGroup.add(leg);
            });
        }
        // 下方柱子處：垂直提升軌＋立柱（到天花板 A_WH）
        const mast = new THREE.Mesh(new THREE.BoxGeometry(0.10, A_WH, 0.10), mBeltS);
        mast.position.set(bx, A_WH / 2, bz1 + 0.25); awnGroup.add(mast);
        const mastR = new THREE.Mesh(new THREE.BoxGeometry(0.34, A_WH, 0.06), mBeltD);
        mastR.position.set(bx, A_WH / 2, bz1 + 0.55); awnGroup.add(mastR);   // 提升機背軌
        // 貨物＝黑色「開放式」料箱（比軌道大：底 0.55×0.65＞軌寬 0.46；四壁 0.06 高、無頂蓋→看得到空腔）
        const cargo = new THREE.Group();
        const cM = new THREE.MeshLambertMaterial({ color: 0x20242a });
        const cW = 0.55, cD = 0.65, cH = 0.06, cT = 0.008;
        const cBot = new THREE.Mesh(new THREE.BoxGeometry(cW, cT, cD), cM);      // 底板
        cBot.position.y = cT / 2; cargo.add(cBot);
        const cF = new THREE.Mesh(new THREE.BoxGeometry(cW, cH, cT), cM);        // 前壁
        cF.position.set(0, cH / 2 + cT / 2, cD / 2 - cT / 2); cargo.add(cF);
        const cBk = cF.clone(); cBk.position.z = -cD / 2 + cT / 2; cargo.add(cBk);   // 後壁
        const cL = new THREE.Mesh(new THREE.BoxGeometry(cT, cH, cD), cM);        // 左壁
        cL.position.set(-cW / 2 + cT / 2, cH / 2 + cT / 2, 0); cargo.add(cL);
        const cR = cL.clone(); cR.position.x = cW / 2 - cT / 2; cargo.add(cR);       // 右壁
        cargo.position.set(bx, 0.25, bz0);
        awnGroup.add(cargo);
        awConv = { cargo: cargo, bx: bx, bz0: bz0, bz1: bz1, t: 0 };
    })();


    // ===== HP24 SMT 拼接機（400×470×1450mm＋面板/拼接台/定位孔/料帶卷盤/出料口） =====
    function buildSplicer(mx, fcz) {
        const G = new THREE.Group();
        const matBody = new THREE.MeshLambertMaterial({ color: 0xb9c0c7 });   // 淺灰金屬
        const matDark = new THREE.MeshLambertMaterial({ color: 0x15181c });   // 面板黑玻璃
        const matSil  = new THREE.MeshLambertMaterial({ color: 0x9aa4ad });   // 銀金屬
        const matYel  = new THREE.MeshLambertMaterial({ color: 0xe0b325 });   // 黃警示
        const matBlue = new THREE.MeshLambertMaterial({ color: 0x22405e });   // 藍卷盤
        const matHead = new THREE.MeshLambertMaterial({ color: 0x7d878f });   // 壓合機構
        const bx = (w, h, d) => new THREE.BoxGeometry(w, h, d);
        // 機身
        const body = new THREE.Mesh(bx(0.2667, 0.9667, 0.3133), matBody);
        body.position.y = 0.4833; G.add(body);
        // 操作面板＋螢幕（前視上方）
        const panel = new THREE.Mesh(bx(0.1333, 0.0600, 0.016), matDark);
        panel.position.set(0, 0.86, 0.3133 / 2 + 0.012); G.add(panel);
        const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.09, 0.045),
            new THREE.MeshBasicMaterial({ color: 0x8fd9ff }));
        scr.position.set(0, 0.865, 0.3133 / 2 + 0.0205); G.add(scr);
        // 中部拼接工作台（銀＋黃警示）
        const plate = new THREE.Mesh(bx(0.1333, 0.0233, 0.20), matSil);
        plate.position.set(0, 0.42, 0.3133 / 2 + 0.008); G.add(plate);
        const warn = new THREE.Mesh(bx(0.1333, 0.006, 0.20), matYel);
        warn.position.set(0, 0.443, 0.3133 / 2 + 0.008); G.add(warn);
        // 定位孔 ×2（工作台前緣）
        [-0.045, 0.045].forEach(ox => {
            const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.02, 10), matSil);
            pin.position.set(ox, 0.45, 0.3133 / 2 + 0.022); G.add(pin);
        });
        // 拼接头/壓合機構（工作台上方）
        const head = new THREE.Mesh(bx(0.20, 0.05, 0.10), matHead);
        head.position.set(0, 0.55, 0.3133 / 2 + 0.04); G.add(head);
        // 左右料帶卷盤（圓柱 Ø150，軸沿 z；左藍右黑）
        [[-0.178, matBlue], [0.178, matDark]].forEach(rp => {
            const reel = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.0333, 14), rp[1]);
            reel.rotation.x = Math.PI / 2; reel.position.set(rp[0], 0.28, 0); G.add(reel);
        });
        // 右側出料口框架（出料方向＝右）
        const out = new THREE.Mesh(bx(0.0667, 0.05, 0.0333), matBody);
        out.position.set(0.24, 0.28, 0.3133 / 2 + 0.03); G.add(out);
        G.scale.setScalar(2);         // 放大 2 倍
        G.position.set(mx, 0, fcz);
                G.rotation.y = Math.PI;   // 正面朝北（面對鐵籠）
        awnGroup.add(G);
    }
    // ===== 綠色 4 腳小桌（下方離地支架層板＋黑色防靜電箱） =====
    function buildEsdTable(mx, fcz) {
        const G = new THREE.Group();
        const matG = new THREE.MeshLambertMaterial({ color: 0x2f9e5f });
        const matL = new THREE.MeshLambertMaterial({ color: 0x3a3f45 });
        const matE = new THREE.MeshLambertMaterial({ color: 0x1b1d21 });
        const top = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.02, 0.16), matG);   // 桌面綠
        top.position.y = 0.72; G.add(top);
        [[-0.09, -0.07], [0.09, -0.07], [-0.09, 0.07], [0.09, 0.07]].forEach(pp => {
            const leg = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.70, 0.016), matL);
            leg.position.set(pp[0], 0.35, pp[1]); G.add(leg);
        });
        const shf = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.014, 0.12), matL);   // 離地支架層板（~10cm）
        shf.position.set(0, 0.10, 0); G.add(shf);
        const esd = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.05, 0.075), matE);   // 桌上黑防靜電箱
        esd.position.set(0, 0.74 + 0.025 + 0.006, 0); G.add(esd);
        G.scale.setScalar(2);         // 放大 2 倍
        G.position.set(mx, 0, fcz);
        awnGroup.add(G);
    }

    // ===== 全部以 InstancedMesh 合併（每種零件 1 次 draw call，保持「獨立零件」外觀） =====
    function buildInst(geo, mat, arr, colorArr, scaleY, yawArr) {
        const n = arr.length / 3; if (!n) return null;
        const im = new THREE.InstancedMesh(geo, mat, n);
        const q = new THREE.Quaternion(), s = new THREE.Vector3(), m = new THREE.Matrix4(), p = new THREE.Vector3(), c = new THREE.Color();
        const _yu = new THREE.Vector3(0, 1, 0);
        for (let i = 0; i < n; i++) {
            p.set(arr[i * 3], arr[i * 3 + 1], arr[i * 3 + 2]);
            q.identity(); if (yawArr && yawArr[i]) q.setFromAxisAngle(_yu, yawArr[i]);
            s.set(1, scaleY || 1, 1); m.compose(p, q, s); im.setMatrixAt(i, m);
            if (colorArr) { c.setHex(colorArr[i]); im.setColorAt(i, c); }
        }
        im.instanceMatrix.needsUpdate = true;
        if (colorArr && im.instanceColor) im.instanceColor.needsUpdate = true;
        return im;
    }
    function buildInstS(geo, mat, arr, scArr) {           // 每 instance x/y/z 縮放（W 大柱用）
        const n = arr.length / 3; if (!n) return null;
        const im = new THREE.InstancedMesh(geo, mat, n);
        const q = new THREE.Quaternion(), s = new THREE.Vector3(), m = new THREE.Matrix4(), p = new THREE.Vector3();
        for (let i = 0; i < n; i++) {
            p.set(arr[i * 3], arr[i * 3 + 1], arr[i * 3 + 2]);
            s.set(scArr[i * 3], scArr[i * 3 + 1], scArr[i * 3 + 2]);
            m.compose(p, q, s); im.setMatrixAt(i, m);
        }
        im.instanceMatrix.needsUpdate = true; return im;
    }
    // 立柱（單位高再縮放 1.2）
    awnGroup.add(buildInst(new THREE.BoxGeometry(POST_S, 1, POST_S), matPostS, pPost, null, PH));
    // 5 層前/後/側/支撐梁＋隔板/圓盤/腳輪/警示燈
    awnGroup.add(buildInst(new THREE.BoxGeometry(0.03, 0.04, 0.4), matBeamS, pBeamS));
    awnGroup.add(buildInst(new THREE.BoxGeometry(0.006, 0.18, 0.14), matDiv, pDiv));
    awnGroup.add(buildInst(reelGeo, matReelM, pReel, pReelC));
    awnGroup.add(buildInst(new THREE.CylinderGeometry(0.035, 0.035, 0.018, 12).rotateZ(Math.PI / 2), matCasterM, pCaster));
    awnGroup.add(buildInst(new THREE.BoxGeometry(0.02, 0.16, 0.02), matPoleM, pPole));
    awnGroup.add(buildInst(new THREE.SphereGeometry(0.028, 10, 10), matBcnM, pBcn, pBnC));
    awnGroup.add(buildInstS(new THREE.BoxGeometry(1, 1, 1), matColW, pColW, pColWS));
    awnGroup.add(buildInst(cartonGeo, matUsedBox, pCart));   // R 貨架層板＋P 棧板紙箱（C 倉同款）
    // 19 行鐵籠網籠：鋼絲 LineSegments（整排一次 draw call）＋四角立柱
    if (cageEnds.length) {
        const cb = new THREE.BufferGeometry();
        cb.setAttribute('position', new THREE.Float32BufferAttribute(cageEnds, 3));
        const cl = new THREE.LineSegments(cb, new THREE.LineBasicMaterial({ color: 0x9fb2bd, transparent: true, opacity: 0.85 }));
        cl.frustumCulled = false;
        awnGroup.add(cl);
    }
    awnGroup.add(buildInst(new THREE.BoxGeometry(0.05, 1, 0.05), matCageSteel, cagePost, null, CAGE_H));
    addZoneSign('A', 0x3d7ec9, '貨架區  IC / S / RH / PM / G', A_CENTER_X / 1.5 + 0, A_CENTER_Z / 1.5 - 17, 0);
    addZoneSign('A', 0xe0a53c, 'SMT 料架區  A~F 圓盤料架', A_CENTER_X / 1.5 + 0, A_CENTER_Z / 1.5 + 20, 0);
    // ===== 四周透明圍牆：與 C 倉同款（高=柱高 4.5m 世界＝3.0 局部、白、半透明）、北邊留出入口 =====
    {
        const T = 0.2, WH = A_WH;
        const ex = A_PITCH_X, ez = A_PITCH_Z;
        const aWallMat = new THREE.MeshLambertMaterial({ color: 0xe8ecef, transparent: true, opacity: 0.30, depthWrite: false, side: THREE.DoubleSide });
        const hw = (A_C / 2) * A_PITCH_X, hd = (A_R / 2) * A_PITCH_Z;      // 半周（cell 邊到邊）
        const ewLen = 2 * hd + ez + 2 * T;                                  // 東西牆長（北線~南線外延）
        const nsLen = 2 * (hw + ex) + 2 * T;                                // 南北牆長（西線外延~東線外延）
        const mkAW = (geo, gx, gz) => {
            const w = new THREE.Mesh(geo, aWallMat);
            w.position.set(gx, WH / 2, gz);
            w.userData.cat = 'wall'; if (ghostStatic.wall) ghostStatic.wall.push(w);
            awnGroup.add(w);
        };
        const mkASeg = (x0, x1, gz) => {                                   // 帶開口分段（北牆）
            const L = Math.abs(x1 - x0);
            const w = new THREE.Mesh(new THREE.BoxGeometry(L, WH, T), aWallMat);
            w.position.set((x0 + x1) / 2, WH / 2, gz);
            w.userData.cat = 'wall'; if (ghostStatic.wall) ghostStatic.wall.push(w);
            awnGroup.add(w);
        };
        const gapW = 4.0;                                                   // 南側出入口寬（世界 6m）
        mkASeg(-(hw + ex + T), -gapW / 2, -hd);                             // 北牆左段
        mkASeg(+gapW / 2, +(hw + ex + T), -hd);                             // 北牆右段
        mkAW(new THREE.BoxGeometry(nsLen, WH, T), 0, hd + ez);              // 南牆（全）
        mkAW(new THREE.BoxGeometry(T, WH, ewLen), -(hw + ex), ez / 2);      // 西牆
        mkAW(new THREE.BoxGeometry(T, WH, ewLen), +(hw + ex), ez / 2);      // 東牆
    }
    scene.add(awnGroup);
}
// 天車補料動畫：傳送帶 → 柱位 → 上頂 → 下放 → 南移出倉消失 → 重生迴圈
function updateAConveyor(dt) {
    if (!awnGroup || !awConv) return;
    const c = awConv, g = c.cargo;
    c.t += dt;
    const SPEED = 1.1, VSPD = 0.5;                 // 水平/垂直速度（局部單位/秒）
    const beltY = 0.20;
    const yB = beltY + 0.05, yT = yB + 3.0;        // 貨物底面高 / 頂高（柱高局部 3.0）
    const cEx = 26.4, cOff = 28.2;                 // r42c88（出倉點，世界 -40.7）→ 更南消失
    const t1 = (c.bz1 - c.bz0) / SPEED;            // 沿帶（r35→r40）
    const t2 = t1 + (yT - yB) / VSPD;              // 垂直上升
    const t3 = t2 + (cEx - c.bz1) / 1.0;           // 頂上南移至 cEx
    const t4 = t3 + (cOff - cEx) / 1.2;                     // 繼續南移到離開 A 倉邊緣
    const T = c.t % t4;
    let cy = yB, cz = c.bz0;
    if (T < t1) {
        cz = c.bz0 + T * SPEED;                             // 水平輸送
    } else if (T < t2) {
        cz = c.bz1; cy = yB + (T - t1) * VSPD;              // 垂直上升（上去就不下來）
    } else if (T < t3) {
        cz = c.bz1 + (T - t2) * 1.0; cy = yT;               // 頂上南移
    } else {
        cz = cEx + (T - t3) * 1.2; cy = yT;                 // 離開 A 倉（只在頂上移動，不下降）
    }
    g.visible = T < t4 - 0.8;                               // 離開 A 倉邊緣後消失，下個迴圈重生
    g.position.set(c.bx, cy, cz);
}

// ==================== A 倉即時資料綁定（wh_a_data.json → 614 個標籤儲位） ====================
// 每分鐘由 PC 排程重新匯出；前端只讀不寫；失敗時保留 last-good
// 資料檔位置（依序嘗試，第一個成功者為準）：
//   1) 與看板同層的相對路徑（任何網域／根目錄／通訊協定皆可，最穩）
//   2) 根目錄絕對路徑（例如 www\ipls 或 api\login 的根）
const A_DATA_URLS = ['wh_a_data.json', '/wh_a_data.json'];
const A_DATA_URL = A_DATA_URLS[1];   // 相容保留
let A_DB = {};
let A_DB_META = null;
let A_CELL_ENTRIES = [];
// 共用幾何／材質（614 個儲位只建一份，節省 GPU）
const _A_hitGeo = new THREE.BoxGeometry(A_PITCH_X * 0.9, 2.4, A_PITCH_Z * 0.9);
const _A_hitMat = new THREE.MeshBasicMaterial({ visible: false });   // 透明點擊盒（raycast 仍命中）
const _A_plateGeo = new THREE.BoxGeometry(A_PITCH_X * 0.8, 0.06, A_PITCH_Z * 0.8);
const _A_plateMat = {
    used:      new THREE.MeshLambertMaterial({ color: 0x8BA5B5 }),   // 灰藍
    empty:     new THREE.MeshLambertMaterial({ color: 0x35B835 }),   // 綠
    no_source: new THREE.MeshLambertMaterial({ color: 0x556677 }),   // 暗灰
    unknown:   new THREE.MeshLambertMaterial({ color: 0xB06CF7 })    // 紫
};
// 料架編號正規化：'A 55' → 'A55'、'IC 7' → 'IC07'、'G 03' → 'G03'、'1AGY' → '1AGY'
function normAId(s) {
    s = String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    const m = s.match(/^([A-Z]*)(\d+)$/);
    return m ? (m[1] + m[2].padStart(2, '0')) : s;
}
async function loadAData() {
    for (let i = 0; i < A_DATA_URLS.length; i++) {
        try {
            const r = await fetch(A_DATA_URLS[i] + '?_=' + Date.now(), { cache: 'no-store' });
            if (!r.ok) continue;
            const d = await r.json();
            if (!d || !d.byCode) continue;
            A_DB = d.byCode;
            A_DB_META = { generatedAt: d.generatedAt, cacheAgeSec: d.cacheAgeSec, source: d.source, url: A_DATA_URLS[i] };
            if (typeof applyAData === 'function') applyAData();
            return;
        } catch (e) { /* try next source */ }
    }
    // 全部來源失敗 → 保留 last-good（畫面維持上次資料）
}
function applyAData() {
    if (!A_CELL_ENTRIES.length) return;
    for (let i = 0; i < A_CELL_ENTRIES.length; i++) {
        const e = A_CELL_ENTRIES[i];
        const rec = A_DB[normAId(e.cell.location)];
        if (rec) {
            e.cell.dbCode = rec.rackGroup || '';
            e.cell.state = (rec.state === 'occupied') ? 'used' : 'empty';
            e.cell.capacity = rec.capacity || 0;
            e.cell.occupiedSlots = rec.occupiedSlots || 0;
            e.cell.totalQty = rec.totalQty || 0;
            e.cell.distinctMaterials = rec.distinctMaterials || 0;
            e.cell.dominantMaterial = rec.dominantMaterial || null;
            e.cell.lastDateIn = rec.lastDateIn || null;
            e.cell.sourceTable = rec.sourceTable || null;
        } else {
            e.cell.state = 'no_source';   // IC/RH/PM/S 等無 DB 來源
            e.cell.dbCode = '';
            e.cell.capacity = 0; e.cell.occupiedSlots = 0; e.cell.totalQty = 0;
            e.cell.distinctMaterials = 0; e.cell.dominantMaterial = null;
            e.cell.lastDateIn = null; e.cell.sourceTable = null;
        }
        if (e.plate) {
            const m = _A_plateMat[e.cell.state] || _A_plateMat.no_source;
            e.plate.material = m;
            e.restMat = m;
        }
    }
    try { if (typeof renderSelectionSummary === 'function') renderSelectionSummary(); } catch (e) { /* summary refresh is best-effort */ }
}
// 在 buildAWarehouse 標籤迴圈內每張標籤後呼叫一次；註冊透明點擊盒 + 狀態色塊 + cellMeshes entry
function registerACell(o) {
    const hit = new THREE.Mesh(_A_hitGeo, _A_hitMat);
    hit.position.set(o.wx, 1.2, o.wz);                   // 局部；awnGroup scale 1.5 → 世界
    hit.userData.cat = 'acell';
    const plateY = o.yy2 - 0.1;                           // 標籤下方一點，貼在料架頂
    const plate = new THREE.Mesh(_A_plateGeo, _A_plateMat.unknown);
    plate.position.set(o.wx, plateY, o.wz);
    plate.userData.cat = 'acell_plate';
    const cell = {
        location: o.lbl,                                  // 平面圖編號（與 A_LABELS 完全一致，如 'A55'）
        dbCode: '',
        kind: 'A',
        state: 'unknown',
        capacity: 0, occupiedSlots: 0, totalQty: 0,
        distinctMaterials: 0, dominantMaterial: null,
        lastDateIn: null, sourceTable: null
    };
    const entry = {
        cell: cell,
        boxes: [],                                         // 核心 raycast 對 boxes 做材質變更；A 留空避免與 plate 衝突
        pallet: [],
        proxy: [hit],                                      // 核心 raycast 把 e.proxy push 到 _rayCache
        footer: null,
        x: A_CENTER_X + o.wx * 1.5,                        // 核心 selectEntry 用 entry.x/.z/.stackMid 定位選取框
        z: A_CENTER_Z + o.wz * 1.5,
        stackMid: plateY * 1.5,
        plate: plate,
        label: o.spr,
        restMat: _A_plateMat.unknown
    };
    hit.userData.entry = entry;
    plate.userData.entry = entry;
    awnGroup.add(hit);
    awnGroup.add(plate);
    cellMeshes.push(entry);                               // 與 2F-C 倉同一個全域陣列
    A_CELL_ENTRIES.push(entry);
}

// ==================== D 倉（SEMS 鋼架庫，C 倉南邊、隔 10 格） ====================
