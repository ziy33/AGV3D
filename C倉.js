const FLOOR_PLAN = [
    'FFFRRRRRRRRRRRWWWRRRRRRRRRRRRRRRRRRWWFFF',
    'FFFRRRRRRRRRRRWWWRRRRRRRRRRRRRRRRRRWWFFF',
    'FFFRRRRRRRRRRRWWWRRRRRRRRRRRRRRRRRRWWFFF',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'WPPPPPPWPPPPPPWWWPPPPPPPPWPPPPPPPPPWWFFF',
    'WPPPPPCWPPPPPPWWWPWCPPPPPWPPPPPCPPPWWFFF',
    'WPPPPPPWPPPPPPWWWPPPPPPPPWPPPPPPPPPWWFFF',
    'WPPPPPPWPPPPPPWWWPPPPPPPPWPPPPPPPPPWWFFF',
    'WPPPPPPWPPPPPPWWWPPPPPPPPWPPPPPPPPPWWFFF',
    'WPPPPPPWPPPPPPWWWPPPPPPPPWPPPPPPPPPWWFFF',
    'WPPPPPPWPPPPPPWWWPPPPPPPPWPPPPPPPPPWWFFF',
    'WPPPPPCWPPPPPPWWWPWCPPPPPWPPPPPCPPPWWFFF',
    'WPPPPPPWPPPPPPWWWPPPPPPPPWPPPPPPPPPWWFFF',
    'WPPPPPPWPPPPPPWWWPPPPPPPPWPPPPPPPPPWWFFF',
    'WPPPPPPWPPPPPPWWWPPPPPPPPWPPPPPPPPPWWFFF',
    'WPPPPPPWPPPPPPWWWPPPPPPPPWPPPPPPPPPWWFFF',
    'WPPPPPPWPPPPPPWWWPPPPPPPPWPPPPPPPPPWWFFF',
    'WPPPPPCWPPPPPPWWWPWCPPPPPWPPPPPCPPPWWFFF',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWFFF',
    'PPPPPPPPPPFFFFWWWPWPWPWPWPWPWPWPWPPWWFFF',
    'PPPPPPPPPPFFFFWWWPWPWPWPWPWPWPWPWPPWWFFF',
    'PPPPPPPPPPFFFFWWWPWPWPWPWPWPWPWPWPPWWFFF',
    'PPPPPPPPPPFFFFWWWPWPWPWPWPWPWPWPWPPWWFFF',
    'PPPPPPPPPPFFFFWWWPWPWPWPWPWPWPWPWPPWWFFF',
];
const C_CODE_R = {"3":["C1-1","C1-2","C1-3","C1-4","C1-5","C1-6","C1-7","C1-8","C1-9","C1-10","C1-11","C1-12","C1-13","C1-14","C1-15"],"4":["C2-1","C2-2","C2-3","C2-4","C2-5","C2-6","C2-7","C2-8","C2-9","C2-10","C2-11","C2-12","C2-13","C2-14","C2-15"],"5":["C3-1","C3-2","C3-3","C3-4","C3-5","C3-6","C3-7","C3-8","C3-9","C3-10","C3-11","C3-12","C3-13","C3-14","C3-15"],"6":["C4-1","C4-2","C4-3","C4-4","C4-5","C4-6","C4-7","C4-8","C4-9","C4-10"],"7":["C5-01","C5-02","C5-03","C5-04","C5-05","C5-06","C5-07","C5-08","C5-09","C5-10","C5-11","C5-12","C5-13","C5-14","C5-15"],"8":["C6-1","C6-2","C6-3","C6-4","C6-5","C6-6","C6-7","C6-8","C6-9","C6-10","C6-11","C6-12","C6-13","C6-14","C6-15"],"9":["C7-1","C7-2","C7-3","C7-4","C7-5","C7-6","C7-7","C7-8","C7-9","C7-10","C7-11","C7-12","C7-13","C7-14","C7-15"],"10":["C8-1","C8-2","C8-3","C8-4","C8-5","C8-6","C8-7","C8-8","C8-9","C8-10","C8-11","C8-12","C8-13","C8-14","C8-15"],"11":["C9-1","C9-2","C9-3","C9-4","C9-5","C9-6","C9-7","C9-8","C9-9","C9-10","C9-11","C9-12","C9-13","C9-14","C9-15"],"12":["C10-1","C10-2","C10-3","C10-4","C10-5","C10-6","C10-7","C10-8","C10-9","C10-10","C10-11","C10-12","C10-13","C10-14","C10-15"],"13":["C11-1","C11-2","C11-3","C11-4","C11-5","C11-6","C11-7","C11-8","C11-9","C11-10","C11-11","C11-12","C11-13","C11-14","C11-15"],"17":["C12-1","C12-2","C12-3","C12-4","C12-5","C12-6","C12-7","C12-8","C12-9","C12-10","C12-11","C12-12","C12-13","C12-14","C12-15"],"18":["C13-1","C13-2","C13-3","C13-4","C13-5","C13-6","C13-7","C13-8","C13-9","C13-10","C13-11","C13-12","C13-13","C13-14","C13-15"],"19":["C14-1","C14-2","C14-3","C14-4","C14-5","C14-6","C14-7","C14-8","C14-9","C14-10"],"20":["C15-01","C15-02","C15-03","C15-04","C15-05","C15-06","C15-07","C15-08","C15-09","C15-10"],"21":["C16-1","C16-2","C16-3","C16-4","C16-5","C16-6","C16-7","C16-8","C16-9","C16-10","C16-11","C16-12","C16-13","C16-14","C16-15"],"22":["C17-1","C17-2","C17-3","C17-4","C17-5","C17-6","C17-7","C17-8","C17-9","C17-10","C17-11","C17-12","C17-13","C17-14","C17-15"],"23":["C18-1","C18-2","C18-3","C18-4","C18-5","C18-6","C18-7","C18-8","C18-9","C18-10","C18-11","C18-12","C18-13","C18-14","C18-15"],"24":["C19-1","C19-2","C19-3","C19-4","C19-5","C19-6","C19-7","C19-8","C19-9","C19-10","C19-11","C19-12","C19-13","C19-14","C19-15"],"25":["C20-1","C20-2","C20-3","C20-4","C20-5","C20-6","C20-7","C20-8","C20-9","C20-10","C20-11","C20-12","C20-13","C20-14","C20-15"],"26":["C21-1","C21-2","C21-3","C21-4","C21-5","C21-6","C21-7","C21-8","C21-9","C21-10","C21-11","C21-12","C21-13","C21-14","C21-15"],"27":["C22-1","C22-2","C22-3","C22-4","C22-5","C22-6","C22-7","C22-8","C22-9","C22-10","C22-11","C22-12","C22-13","C22-14","C22-15"],"28":["C23-1","C23-2","C23-3","C23-4","C23-5","C23-6","C23-7","C23-8","C23-9","C23-10","C23-11","C23-12","C23-13","C23-14","C23-15"],"29":["C24-1","C24-2","C24-3","C24-4","C24-5","C24-6","C24-7","C24-8","C24-9","C24-10","C24-11","C24-12","C24-13","C24-14","C24-15"],"30":["C25-1","C25-2","C25-3","C25-4","C25-5","C25-6","C25-7","C25-8","C25-9","C25-10","C25-11","C25-12","C25-13","C25-14","C25-15"],"31":["C26-1","C26-2","C26-3","C26-4","C26-5","C26-6","C26-7","C26-8","C26-9","C26-10"],"32":["C27-01","C27-02","C27-03","C27-04","C27-05","C27-06","C27-07","C27-08","C27-09","C27-10","C27-11","C27-12","C27-13","C27-14","C27-15"],"33":["C28-1","C28-2","C28-3","C28-4","C28-5","C28-6","C28-7","C28-8","C28-9","C28-10","C28-11","C28-12","C28-13","C28-14","C28-15"],"34":["C29-1","C29-2","C29-3","C29-4","C29-5","C29-6","C29-7","C29-8","C29-9","C29-10","C29-11","C29-12","C29-13","C29-14","C29-15"]};
const C_CODE_P = {"4,1":"2FCA1-5","4,2":"2FCA1-6","4,3":"2FCA1-7","4,4":"2FCA1-8","4,5":"2FCA1-9","4,6":"2FCA1-10","4,8":"2FCA1-11","4,9":"2FCA1-12","4,10":"2FCA1-13","4,11":"2FCA1-14","4,12":"2FCA1-15","4,13":"2FCA1-16","4,17":"2FCB1-1","4,18":"2FCB1-2","4,19":"2FCB1-3","4,20":"2FCB1-4","4,21":"2FCB1-5","4,22":"2FCB1-6","4,23":"2FCB1-7","4,24":"2FCB1-8","4,26":"2FCB1-9","4,27":"2FCB1-10","4,28":"2FCB1-11","4,29":"2FCB1-12","4,30":"2FCB1-13","4,31":"2FCB1-14","4,32":"2FCB1-15","4,33":"2FCB1-16","4,34":"2FCB1-17","5,1":"2FCA2-5","5,2":"2FCA2-6","5,3":"2FCA2-7","5,4":"2FCA2-8","5,5":"2FCA2-9","5,8":"2FCA2-11","5,9":"2FCA2-12","5,10":"2FCA2-13","5,11":"2FCA2-14","5,12":"2FCA2-15","5,13":"2FCA2-16","5,17":"2FCB2-1","5,20":"2FCB2-4","5,21":"2FCB2-5","5,22":"2FCB2-6","5,23":"2FCB2-7","5,24":"2FCB2-8","5,26":"2FCB2-9","5,27":"2FCB2-10","5,28":"2FCB2-11","5,29":"2FCB2-12","5,30":"2FCB2-13","5,32":"2FCB2-15","5,33":"2FCB2-16","5,34":"2FCB2-17","6,1":"2FCA3-5","6,2":"2FCA3-6","6,3":"2FCA3-7","6,4":"2FCA3-8","6,5":"2FCA3-9","6,6":"2FCA3-10","6,8":"2FCA3-11","6,9":"2FCA3-12","6,10":"2FCA3-13","6,11":"2FCA3-14","6,12":"2FCA3-15","6,13":"2FCA3-16","6,17":"2FCB3-1","6,18":"2FCB3-2","6,19":"2FCB3-3","6,20":"2FCB3-4","6,21":"2FCB3-5","6,22":"2FCB3-6","6,23":"2FCB3-7","6,24":"2FCB3-8","6,26":"2FCB3-9","6,27":"2FCB3-10","6,28":"2FCB3-11","6,29":"2FCB3-12","6,30":"2FCB3-13","6,31":"2FCB3-14","6,32":"2FCB3-15","6,33":"2FCB3-16","6,34":"2FCB3-17","7,1":"2FCA4-5","7,2":"2FCA4-6","7,3":"2FCA4-7","7,4":"2FCA4-8","7,5":"2FCA4-9","7,6":"2FCA4-10","7,8":"2FCA4-11","7,9":"2FCA4-12","7,10":"2FCA4-13","7,11":"2FCA4-14","7,12":"2FCA4-15","7,13":"2FCA4-16","7,17":"2FCB4-1","7,18":"2FCB4-2","7,19":"2FCB4-3","7,20":"2FCB4-4","7,21":"2FCB4-5","7,22":"2FCB4-6","7,23":"2FCB4-7","7,24":"2FCB4-8","7,26":"2FCB4-9","7,27":"2FCB4-10","7,28":"2FCB4-11","7,29":"2FCB4-12","7,30":"2FCB4-13","7,31":"2FCB4-14","7,32":"2FCB4-15","7,33":"2FCB4-16","7,34":"2FCB4-17","8,1":"2FCA5-5","8,2":"2FCA5-6","8,3":"2FCA5-7","8,4":"2FCA5-8","8,5":"2FCA5-9","8,6":"2FCA5-10","8,8":"2FCA5-11","8,9":"2FCA5-12","8,10":"2FCA5-13","8,11":"2FCA5-14","8,12":"2FCA5-15","8,13":"2FCA5-16","8,17":"2FCB5-1","8,18":"2FCB5-2","8,19":"2FCB5-3","8,20":"2FCB5-4","8,21":"2FCB5-5","8,22":"2FCB5-6","8,23":"2FCB5-7","8,24":"2FCB5-8","8,26":"2FCB5-9","8,27":"2FCB5-10","8,28":"2FCB5-11","8,29":"2FCB5-12","8,30":"2FCB5-13","8,31":"2FCB5-14","8,32":"2FCB5-15","8,33":"2FCB5-16","8,34":"2FCB5-17","9,1":"2FCA6-5","9,2":"2FCA6-6","9,3":"2FCA6-7","9,4":"2FCA6-8","9,5":"2FCA6-9","9,6":"2FCA6-10","9,8":"2FCA6-11","9,9":"2FCA6-12","9,10":"2FCA6-13","9,11":"2FCA6-14","9,12":"2FCA6-15","9,13":"2FCA6-16","9,17":"2FCB6-1","9,18":"2FCB6-2","9,19":"2FCB6-3","9,20":"2FCB6-4","9,21":"2FCB6-5","9,22":"2FCB6-6","9,23":"2FCB6-7","9,24":"2FCB6-8","9,26":"2FCB6-9","9,27":"2FCB6-10","9,28":"2FCB6-11","9,29":"2FCB6-12","9,30":"2FCB6-13","9,31":"2FCB6-14","9,32":"2FCB6-15","9,33":"2FCB6-16","9,34":"2FCB6-17","10,1":"2FCA7-5","10,2":"2FCA7-6","10,3":"2FCA7-7","10,4":"2FCA7-8","10,5":"2FCA7-9","10,6":"2FCA7-10","10,8":"2FCA7-11","10,9":"2FCA7-12","10,10":"2FCA7-13","10,11":"2FCA7-14","10,12":"2FCA7-15","10,13":"2FCA7-16","10,17":"2FCB7-1","10,18":"2FCB7-2","10,19":"2FCB7-3","10,20":"2FCB7-4","10,21":"2FCB7-5","10,22":"2FCB7-6","10,23":"2FCB7-7","10,24":"2FCB7-8","10,26":"2FCB7-9","10,27":"2FCB7-10","10,28":"2FCB7-11","10,29":"2FCB7-12","10,30":"2FCB7-13","10,31":"2FCB7-14","10,32":"2FCB7-15","10,33":"2FCB7-16","10,34":"2FCB7-17","11,1":"2FCA8-5","11,2":"2FCA8-6","11,3":"2FCA8-7","11,4":"2FCA8-8","11,5":"2FCA8-9","11,8":"2FCA8-11","11,9":"2FCA8-12","11,10":"2FCA8-13","11,11":"2FCA8-14","11,12":"2FCA8-15","11,13":"2FCA8-16","11,17":"2FCB8-1","11,20":"2FCB8-4","11,21":"2FCB8-5","11,22":"2FCB8-6","11,23":"2FCB8-7","11,24":"2FCB8-8","11,26":"2FCB8-9","11,27":"2FCB8-10","11,28":"2FCB8-11","11,29":"2FCB8-12","11,30":"2FCB8-13","11,32":"2FCB8-15","11,33":"2FCB8-16","11,34":"2FCB8-17","12,1":"2FCA9-5","12,2":"2FCA9-6","12,3":"2FCA9-7","12,4":"2FCA9-8","12,5":"2FCA9-9","12,6":"2FCA9-10","12,8":"2FCA9-11","12,9":"2FCA9-12","12,10":"2FCA9-13","12,11":"2FCA9-14","12,12":"2FCA9-15","12,13":"2FCA9-16","12,17":"2FCB9-1","12,18":"2FCB9-2","12,19":"2FCB9-3","12,20":"2FCB9-4","12,21":"2FCB9-5","12,22":"2FCB9-6","12,23":"2FCB9-7","12,24":"2FCB9-8","12,26":"2FCB9-9","12,27":"2FCB9-10","12,28":"2FCB9-11","12,29":"2FCB9-12","12,30":"2FCB9-13","12,31":"2FCB9-14","12,32":"2FCB9-15","12,33":"2FCB9-16","12,34":"2FCB9-17","13,1":"2FCA10-5","13,2":"2FCA10-6","13,3":"2FCA10-7","13,4":"2FCA10-8","13,5":"2FCA10-9","13,6":"2FCA10-10","13,8":"2FCA10-11","13,9":"2FCA10-12","13,10":"2FCA10-13","13,11":"2FCA10-14","13,12":"2FCA10-15","13,13":"2FCA10-16","13,17":"2FCB10-1","13,18":"2FCB10-2","13,19":"2FCB10-3","13,20":"2FCB10-4","13,21":"2FCB10-5","13,22":"2FCB10-6","13,23":"2FCB10-7","13,24":"2FCB10-8","13,26":"2FCB10-9","13,27":"2FCB10-10","13,28":"2FCB10-11","13,29":"2FCB10-12","13,30":"2FCB10-13","13,31":"2FCB10-14","13,32":"2FCB10-15","13,33":"2FCB10-16","13,34":"2FCB10-17","14,1":"2FCA11-5","14,2":"2FCA11-6","14,3":"2FCA11-7","14,4":"2FCA11-8","14,5":"2FCA11-9","14,6":"2FCA11-10","14,8":"2FCA11-11","14,9":"2FCA11-12","14,10":"2FCA11-13","14,11":"2FCA11-14","14,12":"2FCA11-15","14,13":"2FCA11-16","14,17":"2FCB11-1","14,18":"2FCB11-2","14,19":"2FCB11-3","14,20":"2FCB11-4","14,21":"2FCB11-5","14,22":"2FCB11-6","14,23":"2FCB11-7","14,24":"2FCB11-8","14,26":"2FCB11-9","14,27":"2FCB11-10","14,28":"2FCB11-11","14,29":"2FCB11-12","14,30":"2FCB11-13","14,31":"2FCB11-14","14,32":"2FCB11-15","14,33":"2FCB11-16","14,34":"2FCB11-17","15,1":"2FCA12-5","15,2":"2FCA12-6","15,3":"2FCA12-7","15,4":"2FCA12-8","15,5":"2FCA12-9","15,6":"2FCA12-10","15,8":"2FCA12-11","15,9":"2FCA12-12","15,10":"2FCA12-13","15,11":"2FCA12-14","15,12":"2FCA12-15","15,13":"2FCA12-16","15,17":"2FCB12-1","15,18":"2FCB12-2","15,19":"2FCB12-3","15,20":"2FCB12-4","15,21":"2FCB12-5","15,22":"2FCB12-6","15,23":"2FCB12-7","15,24":"2FCB12-8","15,26":"2FCB12-9","15,27":"2FCB12-10","15,28":"2FCB12-11","15,29":"2FCB12-12","15,30":"2FCB12-13","15,31":"2FCB12-14","15,32":"2FCB12-15","15,33":"2FCB12-16","15,34":"2FCB12-17","16,1":"2FCA13-5","16,2":"2FCA13-6","16,3":"2FCA13-7","16,4":"2FCA13-8","16,5":"2FCA13-9","16,6":"2FCA13-10","16,8":"2FCA13-11","16,9":"2FCA13-12","16,10":"2FCA13-13","16,11":"2FCA13-14","16,12":"2FCA13-15","16,13":"2FCA13-16","16,17":"2FCB13-1","16,18":"2FCB13-2","16,19":"2FCB13-3","16,20":"2FCB13-4","16,21":"2FCB13-5","16,22":"2FCB13-6","16,23":"2FCB13-7","16,24":"2FCB13-8","16,26":"2FCB13-9","16,27":"2FCB13-10","16,28":"2FCB13-11","16,29":"2FCB13-12","16,30":"2FCB13-13","16,31":"2FCB13-14","16,32":"2FCB13-15","16,33":"2FCB13-16","16,34":"2FCB13-17","17,1":"2FCA14-5","17,2":"2FCA14-6","17,3":"2FCA14-7","17,4":"2FCA14-8","17,5":"2FCA14-9","17,8":"2FCA14-11","17,9":"2FCA14-12","17,10":"2FCA14-13","17,11":"2FCA14-14","17,12":"2FCA14-15","17,13":"2FCA14-16","17,17":"2FCB14-1","17,20":"2FCB14-4","17,21":"2FCB14-5","17,22":"2FCB14-6","17,23":"2FCB14-7","17,24":"2FCB14-8","17,26":"2FCB14-9","17,27":"2FCB14-10","17,28":"2FCB14-11","17,29":"2FCB14-12","17,30":"2FCB14-13","17,32":"2FCB14-15","17,33":"2FCB14-16","17,34":"2FCB14-17","19,0":"2FCA15-1","19,1":"2FCA15-6","19,2":"2FCA16-1","19,3":"2FCA16-6","19,4":"2FCA17-1","19,5":"2FCA17-6","19,6":"2FCA18-1","19,7":"2FCA18-6","19,8":"2FCA19-1","19,9":"2FCA19-6","19,17":"NG-A01/NG-A06","19,19":"NG-B01/NG-B06","19,21":"NG-C01/NG-C06","19,23":"NG-D01/NG-D06","19,25":"NG-E01/NG-E06","19,27":"NG-F01/NG-F06","19,29":"NG-G01/NG-G06","19,31":"NG-H01/NG-H06","19,33":"NG-I01/NG-I06","19,34":"NG-J01/NG-J06","20,0":"2FCA15-2","20,1":"2FCA15-7","20,2":"2FCA16-2","20,3":"2FCA16-7","20,4":"2FCA17-2","20,5":"2FCA17-7","20,6":"2FCA18-2","20,7":"2FCA18-7","20,8":"2FCA19-2","20,9":"2FCA19-7","20,17":"NG-A02/NG-A07","20,19":"NG-B02/NG-B07","20,21":"NG-C02/NG-C07","20,23":"NG-D02/NG-D07","20,25":"NG-E02/NG-E07","20,27":"NG-F02/NG-F07","20,29":"NG-G02/NG-G07","20,31":"NG-H02/NG-H07","20,33":"NG-I02/NG-I07","20,34":"NG-J02/NG-J07","21,0":"2FCA15-3","21,1":"2FCA15-8","21,2":"2FCA16-3","21,3":"2FCA16-8","21,4":"2FCA17-3","21,5":"2FCA17-8","21,6":"2FCA18-3","21,7":"2FCA18-8","21,8":"2FCA19-3","21,9":"2FCA19-8","21,17":"NG-A03/NG-A08","21,19":"NG-B03/NG-B08","21,21":"NG-C03/NG-C08","21,23":"NG-D03/NG-D08","21,25":"NG-E03/NG-E08","21,27":"NG-F03/NG-F08","21,29":"NG-G03/NG-G08","21,31":"NG-H03/NG-H08","21,33":"NG-I03/NG-I08","21,34":"NG-J03/NG-J08","22,0":"2FCA15-4","22,1":"2FCA15-9","22,2":"2FCA16-4","22,3":"2FCA16-9","22,4":"2FCA17-4","22,5":"2FCA17-9","22,6":"2FCA18-4","22,7":"2FCA18-9","22,8":"2FCA19-4","22,9":"2FCA19-9","22,17":"NG-A04/NG-A09","22,19":"NG-B04/NG-B09","22,21":"NG-C04/NG-C09","22,23":"NG-D04/NG-D09","22,25":"NG-E04/NG-E09","22,27":"NG-F04/NG-F09","22,29":"NG-G04/NG-G09","22,31":"NG-H04/NG-H09","22,33":"NG-I04/NG-I09","22,34":"NG-J04/NG-J09","23,0":"2FCA15-5","23,1":"2FCA15-10","23,2":"2FCA16-5","23,3":"2FCA16-10","23,4":"2FCA17-5","23,5":"2FCA17-10","23,6":"2FCA18-5","23,7":"2FCA18-10","23,8":"2FCA19-5","23,9":"2FCA19-10","23,17":"NG-A05/NG-A010","23,19":"NG-B05/NG-B010","23,21":"NG-C05/NG-C010","23,23":"NG-D05/NG-D010","23,25":"NG-E05/NG-E010","23,27":"NG-F05/NG-F010","23,29":"NG-G05/NG-G010","23,31":"NG-H05/NG-H010","23,33":"NG-I05/NG-I010","23,34":"NG-J05/NG-J010"};
const C_RACK_CODE_CNT = (function () { let n = 0; Object.keys(C_CODE_R).forEach(function (k) { n += C_CODE_R[k].length; }); return n; })();
const C_PALLET_CODE_CNT = (function () { return Object.keys(C_CODE_P).length; })();
const C_TOTAL = C_RACK_CODE_CNT + C_PALLET_CODE_CNT;
const C_CODE_LOOKUP = {};
(function () {
    Object.keys(C_CODE_R).forEach(function (col) {
        const cl = parseInt(col, 10);
        C_CODE_R[col].forEach(function (code) {
            const mm = code.match(/-(\d+)$/); if (!mm) return;
            const sfx = parseInt(mm[1], 10), g = Math.ceil(sfx / 5);
            C_CODE_LOOKUP[normCode(code)] = { kind: 'R', row: 2 - (g - 1), col: cl, level: sfx - (g - 1) * 5, rackGroup: g };
        });
    });
    Object.keys(C_CODE_P).forEach(function (key) {
        const pp = key.split(',');
        C_CODE_LOOKUP[normCode(C_CODE_P[key])] = { kind: 'P', row: +pp[0], col: +pp[1], level: 1, rackGroup: 1 };
    });
})();


const GRID_ROWS = FLOOR_PLAN.length;           // 30
const GRID_COLS = FLOOR_PLAN[0].length;        // 34
const RACK_LEVELS = 5;                          // C 貨架：一組 C# = 3 格（架1/2/3），每格 5 層（L1~L5）
const RACK_LVL_H = 0.45;                        // 鋼架層高（每層 0.45 米）
const RACK_H = 2.4;                             // 鋼架總高（2.4 米）
const RACK_SPAN_Y = RACK_H + 0.15;              // 一組 5 層 + 層間隙 → 頂區 3 座疊起（7.2m）
const REFRESH_INTERVAL = 60000;

const CELL_W = 1.05, CELL_D = 1.05;
const COL_GAP = 0.85, ROW_GAP = 0.85;   // 儲位間距加大：世界淨空 ~1.2（行人寬 0.84 可通過）
const PITCH_X = CELL_W + COL_GAP;               // 1.90
const PITCH_Z = CELL_D + ROW_GAP;               // 1.90

function cellKind(r, c) { return FLOOR_PLAN[r][c]; }
function isWalk(r, c) { return cellKind(r, c) === 'W'; }

// 計算統計
let RACK_CELLS = 0, PALLET_CELLS = 0;
(function () {
    for (let r = 0; r < GRID_ROWS; r++)
        for (let c = 0; c < GRID_COLS; c++) {
            const k = cellKind(r, c);
            if (k === 'R') RACK_CELLS++;
            else if (k === 'P') PALLET_CELLS++;
        }
})();
const TOTAL = RACK_CELLS * RACK_LEVELS + PALLET_CELLS; // 87*5 + 464 = 899

const MATERIAL_POOL = [
    'PCB-MAIN-2045', 'PCB-SUB-1102', 'IC-DRAM-8G', 'SMD-CAP-0603',
    'CONN-USB-C20', 'BLDC-FAN-40', 'LED-STRIP-5630', 'MOSFET-AOD4184',
    'DIODE-SS34', 'PWR-SUPPLY-12V', 'CABLE-HDMI-1M', 'SPEAKER-25MM'
];

// ==================== 對接儲位出入庫系統（即時庫存，同源 HTTP 掛載） ====================
const WH_API_URL = 'http://10.176.33.211:1102/wh_cang/api/api.php?action=dashboard';   // 絕對網址（相容 nginx 與 IIS 站台；注意 https 頁面會遇 mixed content）
let liveEntries = null;       // 最新一批真實資料（loc 已是看板命名 C/D/A/B）

async function refreshLive() {
    try {
        const resp = await fetch(WH_API_URL);
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        const d = await resp.json();
        if (d && Array.isArray(d.entries) && d.entries.length >= 100) {
            liveEntries = d.entries;
            return true;
        }
        throw new Error('bad payload');
    } catch (err) {
        // 真實資料優先：失敗時保留上次資料；從未有過則顯示空（絕不製造假資料）
        if (!Array.isArray(liveEntries)) liveEntries = [];
        return false;
    }
}

function gridPos(r, c) {
    return { x: (c - (GRID_COLS - 1) / 2) * PITCH_X, z: (r - (GRID_ROWS - 1) / 2) * PITCH_Z };
}

// 棧板區欄號規則：只在大馬路（最寬走道）重設、分左右；小走道跨越繼續數
const PALLET_COL_SCHEME = (function () {
    const repRow = FLOOR_PLAN.findIndex(row => row.indexOf('P') >= 0); // 找棧板代表列
    const row = FLOOR_PLAN[repRow];
    const runs = [];
    let start = -1;
    for (let c = 0; c <= GRID_COLS; c++) {
        const isW = (c < GRID_COLS) && row[c] === 'W';
        if (isW && start < 0) start = c;
        else if (!isW && start >= 0) { runs.push([start, c - 1]); start = -1; }
    }
    if (!runs.length) return {};   // 新 2F-C 平面圖走道為 '.'，無 'W' 大馬路段 → 空 scheme（軸標籤跳過）
    const maxLen = Math.max.apply(null, runs.map(rr => rr[1] - rr[0] + 1));
    const big = runs.find(rr => (rr[1] - rr[0] + 1) === maxLen);
    if (!big) return {};
    const scheme = {};
    let counter = 1;
    for (let c = 0; c < big[0]; c++) if (row[c] !== 'W') scheme[c] = { no: counter++, side: '左' };
    counter = 1;
    for (let c = big[1] + 1; c < GRID_COLS; c++) if (row[c] !== 'W') scheme[c] = { no: counter++, side: '右' };
    return scheme;
})();
function colNo(c) { const s = PALLET_COL_SCHEME[c]; return s ? s.no : null; }
function colSide(c) { const s = PALLET_COL_SCHEME[c]; return s ? s.side : ''; }

// 鋼架欄號方案：棧板區的小走道欄在鋼架區是鋼架，需列入編號；同樣只在大馬路重設、分左右
const RACK_COL_SCHEME = (function () {
    const row = FLOOR_PLAN[1]; // 鋼架代表列（左右皆鋼架）
    // 找鋼架列中最寬的 W 段當「大馬路」分界
    let st = -1, bigR = [0, 0];
    for (let c = 0; c <= GRID_COLS; c++) {
        const isW = (c < GRID_COLS) && row[c] === 'W';
        if (isW && st < 0) st = c;
        else if (!isW && st >= 0) { const len = c - 1 - st; if (len > (bigR[1] - bigR[0])) bigR = [st, c - 1]; st = -1; }
    }
    const scheme = {};
    let counter = 1;
    for (let c = 0; c < bigR[0]; c++) if (row[c] === 'R') scheme[c] = { no: counter++, side: '左' };
    counter = 1;
    for (let c = bigR[1] + 1; c < GRID_COLS; c++) if (row[c] === 'R') scheme[c] = { no: counter++, side: '右' };
    return scheme;
})();

// ==================== MOCK DATA（按平面圖生成儲位） ====================
function generateMockData() {
    const out = [];
    Object.keys(C_CODE_R).forEach(function (col) {
        const cl = parseInt(col, 10);
        C_CODE_R[col].forEach(function (code) {
            const mm = code.match(/-(\d+)$/); if (!mm) return;
            const sfx = parseInt(mm[1], 10), g = Math.ceil(sfx / 5);
            const rand = Math.random();
            const state = rand < 0.50 ? 'used' : (rand < 0.56 ? 'special' : 'empty');
            out.push(Object.assign(
                { state: state, material: state === 'empty' ? '' : MATERIAL_POOL[Math.floor(Math.random() * MATERIAL_POOL.length)],
                  qty: state === 'empty' ? 0 : 3 + Math.floor(Math.random() * 18),
                  location: code, row: 0, col: cl, level: sfx - (g - 1) * 5, rackGroup: g, kind: 'R' }));
        });
    });
    Object.keys(C_CODE_P).forEach(function (key) {
        const pp = key.split(',');
        const code = C_CODE_P[key];
        const rand = Math.random();
        const state = rand < 0.50 ? 'used' : (rand < 0.56 ? 'special' : 'empty');
        out.push(Object.assign(
            { state: state, material: state === 'empty' ? '' : MATERIAL_POOL[Math.floor(Math.random() * MATERIAL_POOL.length)],
              qty: state === 'empty' ? 0 : 12 + Math.floor(Math.random() * 38),
              location: code, row: +pp[0], col: +pp[1], level: 1, rackGroup: 1, kind: 'P' }));
    });
    return out;
}

// ==================== THREE.JS SCENE ====================
const workers = [];

function makeWorker() {
    const g = new THREE.Group();
    const matBody = new THREE.MeshLambertMaterial({ color: 0x2E6DC4 }); // 藍色工作服
    const matSkin = new THREE.MeshLambertMaterial({ color: 0xe8b386 });
    const matPants = new THREE.MeshLambertMaterial({ color: 0x2a3a52 });
    const matHat = new THREE.MeshLambertMaterial({ color: 0x2456a8 });   // 小藍帽
    const matTablet = new THREE.MeshLambertMaterial({ color: 0x2b3240 });
    const matScreen = new THREE.MeshLambertMaterial({ color: 0xcfe3f5 });

    const makeLeg = (sx) => {
        const pivot = new THREE.Group();
        pivot.position.set(sx, 0.52, 0);
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.52, 0.13), matPants);
        leg.position.y = -0.26;
        pivot.add(leg);
        g.add(pivot);
        return pivot;
    };
    const legL = makeLeg(-0.09);
    const legR = makeLeg(0.09);

    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.52, 0.22), matBody);
    torso.position.y = 0.82;
    g.add(torso);
    // 胸前反光帶（前方 +Z）
    const chest = new THREE.Mesh(new THREE.BoxGeometry(0.345, 0.10, 0.014),
        new THREE.MeshLambertMaterial({ color: 0xffe066 }));
    chest.position.set(0, 0.84, 0.108);
    g.add(chest);

    // 頭：低頭看平板（頭群組向前傾）
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.12, 0);
    headGroup.rotation.x = 0.55;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 10), matSkin);
    head.position.y = 0.18;
    headGroup.add(head);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.145, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), matHat);
    cap.position.y = 0.33;
    headGroup.add(cap);
    // 長帽簷朝前 (+Z)
    const brim = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.028, 0.22), matHat);
    brim.position.set(0, 0.30, 0.10);
    headGroup.add(brim);
    g.add(headGroup);

    // 手臂（向前下方伸、手持平板）
    const armGeo = new THREE.BoxGeometry(0.07, 0.42, 0.09);
    const makeArm = (sx) => {
        const pivot = new THREE.Group();
        pivot.position.set(sx, 1.06, 0.02);
        pivot.rotation.x = -0.9;
        const arm = new THREE.Mesh(armGeo, matBody);
        arm.position.y = -0.21;
        pivot.add(arm);
        const hand = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.07, 0.09), matSkin);
        hand.position.set(0, -0.45, 0.0);
        pivot.add(hand);
        g.add(pivot);
    };
    makeArm(-0.22);
    makeArm(0.22);

    // 平板電腦（雙手持、低頭看 = 盤點）
    const tablet = new THREE.Group();
    tablet.position.set(0, 0.86, 0.34);
    tablet.rotation.x = -0.4;
    const pid = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.21, 0.025), matTablet);
    tablet.add(pid);
    const scr = new THREE.Mesh(new THREE.BoxGeometry(0.27, 0.18, 0.012), matScreen);
    scr.position.set(0, 0, 0.014);
    tablet.add(scr);
    g.add(tablet);

    g.traverse(o => { if (o.isMesh) o.castShadow = true; });
    g.userData = { legL: legL, legR: legR };
    return g;
}

function initWorkers() {
    // 走道動態偵測：全 W 列 = 橫向人行道；棧板區代表列的最寬 W 段 = 大馬路；其餘小走道
    const walkRows = [];
    for (let r = 0; r < GRID_ROWS; r++) {
        if (FLOOR_PLAN[r].split('').every(ch => ch === 'W')) walkRows.push(r);
    }
    const zHor = (walkRows[0] - (GRID_ROWS - 1) / 2) * PITCH_Z;     // 第一條橫向人行道
    const zHor2 = walkRows[1] != null ? ((walkRows[1] - (GRID_ROWS - 1) / 2) * PITCH_Z) : zHor;
    const repRowW = FLOOR_PLAN.findIndex(row => row.indexOf('P') >= 0);
    const prow = FLOOR_PLAN[repRowW];
    const wRuns = [];
    let wst = -1;
    for (let c = 0; c <= GRID_COLS; c++) {
        const isW = (c < GRID_COLS) && prow[c] === 'W';
        if (isW && wst < 0) wst = c;
        else if (!isW && wst >= 0) { wRuns.push([wst, c - 1]); wst = -1; }
    }
    wRuns.sort((a, b) => ((b[1] - b[0]) - (a[1] - a[0])));
    const bigW = wRuns[0];
    const xBig = (((bigW[0] + bigW[1]) / 2) - (GRID_COLS - 1) / 2) * PITCH_X; // 大馬路
    const smallRuns = wRuns.slice(1);
    const zP0 = (repRowW - (GRID_ROWS - 1) / 2) * PITCH_Z - 0.2;   // 棧板區起
    const zP1 = ((GRID_ROWS - 1) - (GRID_ROWS - 1) / 2) * PITCH_Z + 0.2;

    const xSpan = (GRID_COLS / 2) * PITCH_X - 2;
    const zSpan = (GRID_ROWS / 2) * PITCH_Z - 2;
    const paths = [
        { a: [-xSpan, 0, zHor], b: [xSpan, 0, zHor] },            // 橫向人行道（上）
        { a: [-xSpan, 0, zHor2], b: [xSpan, 0, zHor2] },          // 橫向人行道（下）
        { a: [xBig, 0, -zSpan], b: [xBig, 0, zSpan] },            // 縱向大馬路
        ...smallRuns.map(rr => ({ a: [(((rr[0] + rr[1]) / 2) - (GRID_COLS - 1) / 2) * PITCH_X, 0, zP0], b: [(((rr[0] + rr[1]) / 2) - (GRID_COLS - 1) / 2) * PITCH_X, 0, zP1] })) // 小走道
    ];

    paths.forEach((pt, i) => {
        const worker = makeWorker();
        worker.position.set(pt.a[0], 0, pt.a[2]);
        const isH = pt.a[2] === pt.b[2];   // 水平走道 vs 垂直走道
        workers.push({
            group: worker,
            a: new THREE.Vector3(pt.a[0], 0, pt.a[2]),
            b: new THREE.Vector3(pt.b[0], 0, pt.b[2]),
            dist: (i * 7) % (2 * 26),
            speed: 0.8 + (i % 3) * 0.35,
            freq: 4 + (i % 3) * 0.6,
            // 盤點停點
            travel: (i * 0.9) % 1.7,          // 已走距離（用來算下一個停點）
            spacing: 1.7,                     // 每走 1.7 停一次
            dwell: 1.2 + (i % 4) * 0.35,      // 停留時間
            pauseT: 0,
            faceAngle: 0,
            sideIdx: i % 2,
            sideAngles: isH ? [0, Math.PI] : [-Math.PI / 2, Math.PI / 2] // 面向儲位方向
        });
        world.add(worker);
    });
}

function updateWorkers(dt, t) {
    workers.forEach(w => {
        // 停留：面向儲位（走道側邊），微微搖擺
        if (w.pauseT > 0) {
            w.pauseT -= dt;
            const target = w.faceAngle;
            let cur = w.group.rotation.y;
            const diff = ((((target - cur) % (Math.PI * 2)) + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
            w.group.rotation.y = cur + diff * Math.min(1, dt * 6);
            const sw = Math.sin(t * 2) * 0.06;
            w.group.userData.legL.rotation.x = sw;
            w.group.userData.legR.rotation.x = -sw;
            w.group.position.y = 0.02;
            return;
        }
        // 行走
        const len = w.a.distanceTo(w.b);
        const prev = w.group.position.clone();
        w.dist += w.speed * dt;
        const period = 2 * len;
        const d = w.dist % period;
        const fwd = d <= len;
        const tt = (fwd ? d : period - d) / len;
        w.group.position.lerpVectors(w.a, w.b, tt);
        // 面向行進方向（帽簷→前方）
        const dirV = w.group.position.clone().sub(prev);
        if (dirV.lengthSq() > 1e-8) {
            w.group.rotation.y = Math.atan2(dirV.x, dirV.z);
        }
        const ph = w.dist * w.freq;
        w.group.userData.legL.rotation.x = Math.sin(ph) * 0.55;
        w.group.userData.legR.rotation.x = Math.sin(ph + Math.PI) * 0.55;
        w.group.position.y = Math.abs(Math.cos(ph)) * 0.035;
        // 走到間距 → 停點（面向下一個儲位）
        w.travel += w.speed * dt;
        if (w.travel >= w.spacing) {
            w.travel = 0;
            w.pauseT = w.dwell;
            w.faceAngle = w.sideAngles[w.sideIdx % 2];
            w.sideIdx++;
        }
    });
}

// ==================== 靜態場景（平台/走道/鋼架框架/格線） ====================
function buildStaticProps() {
    propGroup = new THREE.Group();

    // 外圍大地基尺寸（供馬路/格線/地標參考）
    const platW = GRID_COLS * PITCH_X + 0.6;
    const platD = GRID_ROWS * PITCH_Z + 0.6;
    // 平台底板（外圍大地基）— 整片用人行道（馬路）混凝土色，做為全場地板
    const platform = new THREE.Mesh(
        new THREE.BoxGeometry(platW, 0.2, platD),
        new THREE.MeshLambertMaterial({ color: 0x76828c })
    );
    platform.position.y = -0.1;
    platform.receiveShadow = true;
    propGroup.add(platform);

    // 對齊格線
    const halfW = platW / 2, halfD = platD / 2;
    const pts = [];
    for (let c = 0; c <= GRID_COLS; c++) {
        const x = (c - GRID_COLS / 2) * PITCH_X;
        pts.push(x, 0, -halfD, x, 0, halfD);
    }
    for (let r = 0; r <= GRID_ROWS; r++) {
        const z = (r - GRID_ROWS / 2) * PITCH_Z;
        pts.push(-halfW, 0, z, halfW, 0, z);
    }
    const gl = new THREE.BufferGeometry();
    gl.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    const gridLines = new THREE.LineSegments(gl, new THREE.LineBasicMaterial({ color: 0x1c3646 }));
    gridLines.position.y = 0.012;
    propGroup.add(gridLines);

    // 鋼架框架（固定，每次刷新不重建）：同一排連續 R 連成一條長貨架（長邊沿列 X，深度維持 1.30）
    const frameMat = new THREE.MeshLambertMaterial({ color: 0x1B7FA8 }); // 橫樑：深藍
    const postMat  = new THREE.MeshLambertMaterial({ color: 0x14663a }); // 立柱：深綠
    const slabMat  = new THREE.MeshLambertMaterial({ color: 0x1c7a43 }); // 層板（板子）深綠
    const runPostGeo = new THREE.BoxGeometry(0.12, RACK_H, 0.12);
    const runSlabGeo = new THREE.BoxGeometry(1, 0.07, 1.30);   // 長度 1，使用 scale.x=runLen（沿列連成長條，旋轉 90°）
    const runBeamGeo = new THREE.BoxGeometry(1, 0.05, 0.06);
    const runHalfD = 0.65;                                     // 深度一半（維持 1.30 前後）
    for (let r = 0; r < GRID_ROWS; r++) {
        let c = 0;
        while (c < GRID_COLS) {
            if (cellKind(r, c) !== 'R') { c++; continue; }
            const c0 = c; while (c < GRID_COLS && cellKind(r, c) === 'R') c++;
            const cEnd = c, runCols = cEnd - c0;
            const pa = gridPos(r, c0), pb = gridPos(r, cEnd - 1);
            const cx = (pa.x + pb.x) / 2, cz = pa.z;
            const L = (runCols - 1) * PITCH_X + CELL_W * 0.94;   // 連續長度（略縮，避免碰鄰排）
            const g = new THREE.Group();
            g.position.set(cx, 0, cz);
            g.userData.cat = 'rack';
            ghostStatic.rack.push(g);
            // 立柱：整排等距分佈（前後兩側），保留「一格一柱」節奏
            for (let i = 0; i <= runCols; i++) {
                const px = -L / 2 + (i / runCols) * L;
                [-runHalfD, runHalfD].forEach(oz => {
                    const post = new THREE.Mesh(runPostGeo, postMat);
                    post.position.set(px, RACK_H / 2, oz);
                    g.add(post);
                });
            }
            for (let lv = 0; lv < RACK_LEVELS; lv++) {
                const yTop = lv * RACK_LVL_H;
                const slab = new THREE.Mesh(runSlabGeo, slabMat);
                slab.scale.x = L; slab.position.set(0, yTop + 0.035, 0);
                g.add(slab);
                const fb = new THREE.Mesh(runBeamGeo, frameMat);
                fb.scale.x = L; fb.position.set(0, yTop + 0.035, -runHalfD);
                g.add(fb);
                const bb = new THREE.Mesh(runBeamGeo, frameMat);
                bb.scale.x = L; bb.position.set(0, yTop + 0.035, runHalfD);
                g.add(bb);
            }
            propGroup.add(g);
        }
    }
    const PILLAR_H = 4.5;   // 頂區 3 排 5 層貨架並排，牆/承重柱維持 4.5m
    const PILLAR_W = CELL_W * 0.96 * 1.5;
    const PILLAR_D = CELL_D * 0.96 * 1.5;
    const pillarMat = new THREE.MeshLambertMaterial({ color: 0xf0f2f4 });
    const pillarGeo = new THREE.BoxGeometry(PILLAR_W, PILLAR_H, PILLAR_D);
    const pillarCells = [];   // 柱子依 ID 順序（A1..A12）
    let pillarId = 1;
    for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
            if (cellKind(r, c) === 'C') {
                pillarCells.push([r, c]);
                const pp = gridPos(r, c);
                const pil = new THREE.Mesh(pillarGeo, pillarMat);
                pil.position.set(pp.x, PILLAR_H / 2, pp.z);
                pil.userData.cat = 'pillar';
                ghostStatic.pillar.push(pil);
                propGroup.add(pil);
                const lbl = makeLabelSprite('A' + (pillarId++), '#ff4d4f', 1.3, 0.55);
                lbl.position.set(pp.x, PILLAR_H + 0.15, pp.z);
                propGroup.add(lbl);
            }
        }
    }

    // 2F-C 設施區（F 碼）：薄板＋名牌
    (function () {
        const fzDefs = [
            { r0: 0, r1: 0, c0: 0, c1: 2, name: '分料拆解區' },
            { r0: 0, r1: 0, c0: 37, c1: 39, name: 'IQC檢驗區' },
            { r0: 19, r1: 23, c0: 10, c1: 13, name: 'NG收料區' }
        ];
        fzDefs.forEach(function (fz) {
            const pa = gridPos(fz.r0, fz.c0), pb = gridPos(fz.r1, fz.c1);
            const fx = (pa.x + pb.x) / 2, fzm = (pa.z + pb.z) / 2;
            const w = Math.abs(pb.x - pa.x) + CELL_W, dd = Math.abs(pb.z - pa.z) + CELL_D;
            const mat = new THREE.MeshLambertMaterial({ color: 0x2a3540, transparent: true, opacity: 0.85 });
            const m2 = new THREE.Mesh(new THREE.BoxGeometry(w, 0.06, dd), mat);
            m2.position.set(fx, 0.03, fzm); propGroup.add(m2);
            const lb = makeLabelSprite(fz.name, '#eaffff', Math.min(4.5, w * 0.62), 0.6);
            lb.position.set(fx, 0.5, fzm); propGroup.add(lb);
        });
    })();

    // 四周圍牆：白色、與承重柱同高；北牆（貨架區）原位不動＋留有出入口開口，
    // 其餘三面往外延展 1 格，且長度沿新輪廓加長，四角完整接合圍起
    {
        const T = 0.2;
        const ex = PITCH_X, ez = PITCH_Z;              // 延展量 = 1 格
        const wallMat = new THREE.MeshLambertMaterial({ color: 0xf0f2f4 });
        const ewLen = 2 * halfD + ez + 2 * T;          // 東西牆：北牆線 ~ 南牆外緣
        const nsLen = 2 * (halfW + ex) + 2 * T;        // 南牆：西牆外緣 ~ 東牆外緣
        const ewGeo = new THREE.BoxGeometry(T, PILLAR_H, ewLen);
        const nsGeo = new THREE.BoxGeometry(nsLen, PILLAR_H, T);
        const mkWall = (geo, gx, gz) => {
            const w = new THREE.Mesh(geo, wallMat);
            w.position.set(gx, PILLAR_H / 2, gz);
            w.userData.cat = 'wall';
            ghostStatic.wall.push(w);
            propGroup.add(w);
        };
        // 北牆（貨架區，z 線不變）：拆兩段、留出入口開口（中心 x=-4.53、寬 5.0，對應倉外兩扇灰門）
        const entranceX = -4.53, gapW = 5.0, wallL2 = halfW + ex + T;   // 伸到東西牆外緣，轉角接合
        const mkSeg = (x0, x1) => {
            const L = Math.abs(x1 - x0);
            const w = new THREE.Mesh(new THREE.BoxGeometry(L, PILLAR_H, T), wallMat);
            w.position.set((x0 + x1) / 2, PILLAR_H / 2, -halfD);
            w.userData.cat = 'wall';
            ghostStatic.wall.push(w);
            propGroup.add(w);
        };
        mkSeg(-wallL2, entranceX - gapW / 2);          // 北牆-入口左段
        mkSeg(entranceX + gapW / 2, wallL2);           // 北牆-入口右段

        mkWall(nsGeo, 0, halfD + ez);                  // 南牆：外延 1 格、加長到整段
        mkWall(ewGeo, -(halfW + ex), ez / 2);         // 西牆：中心 z=+ez/2，兩端咬住北/南牆
        mkWall(ewGeo,  halfW + ex, ez / 2);          // 東牆：中心 z=+ez/2，兩端咬住北/南牆
    }

    // 電視：掛南牆內側、面朝北（大門口方向），人一進門正前方即見
    const tvFrameMat = new THREE.MeshBasicMaterial({ color: 0x14181c });
    {
        const halfD2 = ((GRID_ROWS - 1) / 2) * PITCH_Z;
        const southInner = halfD2 + PITCH_Z - 0.2 / 2 - 0.05;   // 南牆內側面（半深+延格-半厚-0.05）
        const tv = new THREE.Group();
        tv.position.set(-3.4, 4.0, southInner);   // 人行道中間略靠 A 區
        const frame = new THREE.Mesh(new THREE.BoxGeometry(TV_W, TV_H, 0.10), tvFrameMat);
        tv.add(frame);
        const screen = new THREE.Mesh(
            new THREE.PlaneGeometry(TV_W * 0.92, TV_H * 0.86),
            new THREE.MeshBasicMaterial({ map: tvTex })
        );
        screen.position.z = 0.058;
        tv.add(screen);
        tv.rotation.y = Math.PI;   // 面向北（-z，大門口）
        tv.userData.cat = 'tv';
        ghostStatic.tv.push(tv);
        propGroup.add(tv);
    }

    // 電視（A8 柱東面／2FCA 側）：貼 A8 柱東側面、面向東（+x），顯示同一出庫指示畫面
    {
        const pc8a = (function () {   // A5 柱（掃描第 5 個 'C' 柱）
            let n = 0, pp = null;
            for (let r = 0; r < GRID_ROWS && !pp; r++) for (let c = 0; c < GRID_COLS; c++) {
                if (cellKind(r, c) === 'C') { n++; if (n === 5) { pp = gridPos(r, c); break; } }
            }
            return pp || gridPos(12, 18);
        })();   // 第二台電視 → A5
        const pw8a = CELL_W * 0.96 * 1.5, pd8a = CELL_D * 0.96 * 1.5;
        const tw = 2.6, th = tw * 9 / 16;                       // 電視加大（柱側上段）
        const tv8 = new THREE.Group();
        tv8.position.set(pc8a.x + pw8a / 2 + 0.05, 3.7, pc8a.z);   // A8 柱東面、上段（避開方位牌）
        const frame8 = new THREE.Mesh(new THREE.BoxGeometry(0.08, th, tw), tvFrameMat);  // 厚沿 x（東西）
        tv8.add(frame8);
        const screen8 = new THREE.Mesh(
            new THREE.PlaneGeometry(tw * 0.92, th * 0.86),
            new THREE.MeshBasicMaterial({ map: tvTex })
        );
        screen8.raycast = () => {};   // 擋光線拾取，避免擋到下方儲位點擊
        screen8.rotation.y = Math.PI / 2;  // plane +z 法線 → +x（面向東）
        screen8.position.x = 0.05;         // 朝東凸出
        tv8.add(screen8);
        tv8.userData.cat = 'tv';
        ghostStatic.tv.push(tv8);
        propGroup.add(tv8);
    }

    // A8 柱四面方位標（東/南/西/北）：柱身中段各貼一面字牌、朝外，方便溝通方位
    {
        const mkLabelTex = (ch, fg) => {
            const cv = document.createElement('canvas');
            cv.width = cv.height = 256;
            const c = cv.getContext('2d');
            c.fillStyle = '#143342';
            c.fillRect(0, 0, 256, 256);
            c.strokeStyle = 'rgba(255,255,255,0.75)';
            c.lineWidth = 8;
            c.strokeRect(8, 8, 240, 240);
            c.fillStyle = fg;
            c.font = 'bold 140px "Microsoft JhengHei", "Segoe UI", sans-serif';
            c.textAlign = 'center';
            c.textBaseline = 'middle';
            c.fillText(ch, 128, 133);
            const t = new THREE.CanvasTexture(cv);
            t.minFilter = THREE.LinearFilter;
            return t;
        };
        const pc8 = (function () {   // A5 柱（掃描第 5 個 'C' 柱）
            let n = 0, pp = null;
            for (let r = 0; r < GRID_ROWS && !pp; r++) for (let c = 0; c < GRID_COLS; c++) {
                if (cellKind(r, c) === 'C') { n++; if (n === 5) { pp = gridPos(r, c); break; } }
            }
            return pp || gridPos(12, 18);
        })();              // 方位牌中心 → A5
        const pw8 = CELL_W * 0.96 * 1.5;          // 柱寬（x）
        const pd8 = CELL_D * 0.96 * 1.5;          // 柱深（z）
        const yL8 = 2.4, off8 = 0.04;             // 柱身中段、貼面外 4cm
        const mkF = (ch, rotY, x, z) => {
            const m = new THREE.Mesh(
                new THREE.PlaneGeometry(0.9, 0.9),
                new THREE.MeshBasicMaterial({ map: mkLabelTex(ch, '#ffd24d'), side: THREE.DoubleSide })
            );
            m.position.set(x, yL8, z);
            m.rotation.y = rotY;
            m.userData.cat = 'sign';
            ghostStatic.sign.push(m);
            propGroup.add(m);
        };
        mkF('東',  Math.PI / 2,  pc8.x + pw8 / 2 + off8, pc8.z);   // 面朝 +x（東）
        mkF('南',  0,             pc8.x, pc8.z + pd8 / 2 + off8);  // 面朝 +z（南）
        mkF('西', -Math.PI / 2,  pc8.x - pw8 / 2 - off8, pc8.z);   // 面朝 -x（西）
        mkF('北',  Math.PI,       pc8.x, pc8.z - pd8 / 2 - off8);  // 面朝 -z（北）
    }

    // 監控桌＋電腦（依除錯點擊 x=47.79 z=-30.27 世界 → 局部 /1.5）
    {
        const dx = 47.79 / 1.5, dz = -30.27 / 1.5;
        const deskG = new THREE.Group();
        const topMat = new THREE.MeshLambertMaterial({ color: 0x8a6a42 });
        const legMat = new THREE.MeshLambertMaterial({ color: 0x5a4630 });
        const monMat = new THREE.MeshLambertMaterial({ color: 0x20262c });
        // 桌面＋四腳
        const top = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.06, 1.1), topMat);
        top.position.y = 0.74;
        deskG.add(top);
        [-0.95, 0.95].forEach(lx => [-0.45, 0.45].forEach(lz => {
            const leg = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.74, 0.07), legMat);
            leg.position.set(lx, 0.37, lz);
            deskG.add(leg);
        }));
        // 電腦螢幕（立於桌面、面朝倉內）＋鍵盤；螢幕顯示 EIP 入口網站
        const stand = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.06), monMat);
        stand.position.y = 0.82;
        deskG.add(stand);
        const eipTex = (function () {
            const cv = document.createElement('canvas');
            cv.width = 640; cv.height = 360;
            const c = cv.getContext('2d');
            // 瀏覽器工具列
            c.fillStyle = '#3a6ea5';
            c.fillRect(0, 0, 640, 46);
            c.fillStyle = 'rgba(255,255,255,0.85)';
            c.font = '20px "Segoe UI", sans-serif';
            c.textAlign = 'left'; c.textBaseline = 'middle';
            c.fillText('EIP', 14, 23);
            // 網址列（顯示指定網址）
            c.fillStyle = '#ffffff';
            c.fillRect(8, 56, 624, 32);
            c.fillStyle = '#1a1a1a';
            c.font = '600 22px Consolas, "Courier New", monospace';
            c.fillText('https://eip.tb.pegatroncorp.com/eip/', 18, 73);
            // 頁面
            c.fillStyle = '#f4f7f9';
            c.fillRect(0, 100, 640, 260);
            c.fillStyle = '#0e3a5d';
            c.font = 'bold 44px "Segoe UI", sans-serif';
            c.fillText('Employee Internet Portal', 28, 170);
            c.fillStyle = '#4a6a80';
            c.font = '28px "Segoe UI", sans-serif';
            c.fillText('EIP 企業入口網站', 28, 226);
            const t = new THREE.CanvasTexture(cv);
            t.minFilter = THREE.LinearFilter;
            return t;
        })();
        const scr = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.45, 0.05), monMat);
        scr.position.y = 1.16;
        scr.rotation.y = 0.06;
        deskG.add(scr);
        const face = new THREE.Mesh(
            new THREE.PlaneGeometry(0.78, 0.43),
            new THREE.MeshBasicMaterial({ map: eipTex })
        );
        face.position.z = 0.027;   // 貼在螢幕面板前方
        scr.add(face);
        const kbd = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.03, 0.22), monMat);
        kbd.position.set(0.12, 0.785, -0.3);
        deskG.add(kbd);
        deskG.position.set(dx, 0, dz);
        scr.userData.interact = 'pcC';                // 第一人稱看 C 倉螢幕可傳送
        deskG.userData.cat = 'sign';
        deskG.traverse(o => { if (o.isMesh) o.castShadow = true; });
        ghostStatic.sign.push(deskG);
        propGroup.add(deskG);
    }

    // C 倉右下角廣告牌（同 D 倉「C 倉」大看板樣式，面向鏡頭）
    {
        const billC = new THREE.Group();
        const signTexC = (function () {
            const cv = document.createElement('canvas'); cv.width = 1280; cv.height = 640;
            const c = cv.getContext('2d');
            const gr = c.createLinearGradient(0, 0, 0, 640);
            gr.addColorStop(0, '#8a5a1f'); gr.addColorStop(0.5, '#6f3f10'); gr.addColorStop(1, '#4a2608');
            c.fillStyle = gr; c.fillRect(0, 0, 1280, 640);
            c.strokeStyle = '#ffd866'; c.lineWidth = 14; c.strokeRect(22, 22, 1236, 596);
            c.lineWidth = 4; c.strokeStyle = 'rgba(255,230,150,0.85)'; c.strokeRect(40, 40, 1200, 560);
            c.textAlign = 'center'; c.textBaseline = 'middle';
            c.fillStyle = '#ffe9a8'; c.font = '900 400px "Microsoft JhengHei","Segoe UI",sans-serif';
            c.fillText('C 倉', 640, 322);
            const t = new THREE.CanvasTexture(cv); t.minFilter = THREE.LinearFilter; return t;
        })();
        const panelC = new THREE.Mesh(new THREE.PlaneGeometry(9.0, 4.5),
            new THREE.MeshBasicMaterial({ map: signTexC, side: THREE.DoubleSide }));
        billC.add(panelC);
        billC.position.set(38.5, 2.9, 19.5);       // C 倉東南隅（世界 x≈58 z≈29）
        billC.userData.isBoard = true;
        propGroup.add(billC);
        (window.__dbb = window.__dbb || []).push(billC);   // 早期建置（C 倉怕 TDZ）
    }

    // 電視（A8 柱西面）：貼 A8 柱西側面、面向西（-x），顯示同一出庫指示畫面
    {
        const pc8b = (function () {   // A5 柱（掃描第 5 個 'C' 柱）
            let n = 0, pp = null;
            for (let r = 0; r < GRID_ROWS && !pp; r++) for (let c = 0; c < GRID_COLS; c++) {
                if (cellKind(r, c) === 'C') { n++; if (n === 5) { pp = gridPos(r, c); break; } }
            }
            return pp || gridPos(12, 18);
        })();
        const pw8b = CELL_W * 0.96 * 1.5, pd8b = CELL_D * 0.96 * 1.5;
        const tw = 2.6, th = tw * 9 / 16;                        // 電視加大（柱側上段）
        const tv9 = new THREE.Group();
        tv9.position.set(pc8b.x - pw8b / 2 - 0.05, 3.7, pc8b.z);   // A8 柱西面、上段（避開方位牌）
        const frame9 = new THREE.Mesh(new THREE.BoxGeometry(0.08, th, tw), tvFrameMat);  // 厚沿 x（東西）
        tv9.add(frame9);
        const screen9 = new THREE.Mesh(
            new THREE.PlaneGeometry(tw * 0.92, th * 0.86),
            new THREE.MeshBasicMaterial({ map: tvTex })
        );
        screen9.raycast = () => {};   // 擋光線拾取，避免擋到下方儲位點擊
        screen9.rotation.y = -Math.PI / 2;  // plane +z 法線 → -x（面向西）
        screen9.position.x = -0.05;         // 朝西凸出
        tv9.add(screen9);
        tv9.userData.cat = 'tv';
        ghostStatic.tv.push(tv9);
        propGroup.add(tv9);
    }

    // 馬路：連續一體的灰色混凝土帶（不用格子）
    const roadMat = new THREE.MeshLambertMaterial({ color: 0x76828c });
    const roadY = 0.014;
    // 0) 找出全部「全 W 列」＝橫向人行道
    const walkRows = [];
    for (let r = 0; r < GRID_ROWS; r++) {
        if (FLOOR_PLAN[r].split('').every(ch => ch === 'W')) walkRows.push(r);
    }
    // 1) 水平大馬路：每一條全 W 列
    walkRows.forEach(zr => {
        const zR = (zr - (GRID_ROWS - 1) / 2) * PITCH_Z;
        const h = new THREE.Mesh(new THREE.BoxGeometry(platW * 0.98, 0.02, PITCH_Z * 0.96), roadMat);
        h.userData.cat = 'road';
        ghostStatic.road.push(h);
        h.position.set(0, roadY, zR);
        propGroup.add(h);
    });
    // 2) 垂直馬路：最寬 = 大馬路（全場貫穿）；其餘小走道只涵蓋棧板區
    {
        const repRow = FLOOR_PLAN.findIndex(row => row.indexOf('P') >= 0);
        const lastPRow = (() => { for (let r = GRID_ROWS - 1; r >= 0; r--) if (FLOOR_PLAN[r].indexOf('P') >= 0) return r; return repRow; })();
        const row = FLOOR_PLAN[repRow];
        const runs = [];
        let start = -1;
        for (let c = 0; c <= GRID_COLS; c++) {
            const isW = (c < GRID_COLS) && row[c] === 'W';
            if (isW && start < 0) start = c;
            else if (!isW && start >= 0) { runs.push([start, c - 1]); start = -1; }
        }
        runs.sort((a, b) => (b[1] - b[0]) - (a[1] - a[0]));
        const big = runs[0];
        const bigCx = ((big[0] + big[1]) / 2 - (GRID_COLS - 1) / 2) * PITCH_X;
        const bigW = (big[1] - big[0] + 1) * PITCH_X * 0.98;
        const vBig = new THREE.Mesh(new THREE.BoxGeometry(bigW, 0.02, platD * 0.98), roadMat);
        vBig.userData.cat = 'road';
        ghostStatic.road.push(vBig);
        vBig.position.set(bigCx, roadY + 0.002, 0);
        propGroup.add(vBig);
        const z0 = (repRow - (GRID_ROWS - 1) / 2) * PITCH_Z;
        const z1 = ((lastPRow) - (GRID_ROWS - 1) / 2) * PITCH_Z;
        runs.slice(1).forEach(rr => {
            const cxx = ((rr[0] + rr[1]) / 2 - (GRID_COLS - 1) / 2) * PITCH_X;
            const ww = (rr[1] - rr[0] + 1) * PITCH_X * 0.98;
            const vv = new THREE.Mesh(new THREE.BoxGeometry(ww, 0.02, (z1 - z0) + PITCH_Z * 0.9), roadMat);
        vv.userData.cat = 'road';
        ghostStatic.road.push(vv);
            vv.position.set(cxx, roadY + 0.002, (z0 + z1) / 2);
            propGroup.add(vv);
        });
    }

    // 人行道邊緣斑馬紋（黑／黃長條虛線；十字路口不畫）
    const zebraMats = [
        new THREE.MeshLambertMaterial({ color: 0x151C26 }),
        new THREE.MeshLambertMaterial({ color: 0xFFC926 })
    ];
    const zebraGeo = new THREE.BoxGeometry(0.30, 0.022, 0.72);
    const zebraY = 0.026;
    // 垂直馬道分列（大馬路 / 小走道）
    const repRow = FLOOR_PLAN.findIndex(row => row.indexOf('P') >= 0);
    const lastPRow = (() => { for (let r = GRID_ROWS - 1; r >= 0; r--) if (FLOOR_PLAN[r].indexOf('P') >= 0) return r; return repRow; })();
    const prow = FLOOR_PLAN[repRow];
    const zruns = [];
    let zstart = -1;
    for (let c = 0; c <= GRID_COLS; c++) {
        const isW = (c < GRID_COLS) && prow[c] === 'W';
        if (isW && zstart < 0) zstart = c;
        else if (!isW && zstart >= 0) { zruns.push([zstart, c - 1]); zstart = -1; }
    }
    zruns.sort((a, b) => (b[1] - b[0]) - (a[1] - a[0]));
    const zbig = zruns[0];
    const zbigCx = ((zbig[0] + zbig[1]) / 2 - (GRID_COLS - 1) / 2) * PITCH_X;
    const walkRows2 = [];
    for (let r = 0; r < GRID_ROWS; r++) {
        if (FLOOR_PLAN[r].split('').every(ch => ch === 'W')) walkRows2.push(r);
    }
    const zHorR = (walkRows2[0] - (GRID_ROWS - 1) / 2) * PITCH_Z;   // 第一條橫向人行道
    const zEntr = (repRow - (GRID_ROWS - 1) / 2) * PITCH_Z;        // 小走道入口（棧板區起）
    // 十字路口（大馬路 × 橫向人行道）：交會矩形內全不畫
    // T 字路口（小走道 × 橫向人行道）：走道帶 + 小走道入口處全不畫
    const clearRects = [
        { x: zbigCx, z: zHorR, hx: ((zbig[1] - zbig[0]) + 1) * PITCH_X * 0.5, hz: PITCH_Z * 0.5 }
    ];
    {
        const row4C = zEntr;                                   // 小走道入口中心 z
        zruns.slice(1).forEach(rr => {
            const cxx = ((rr[0] + rr[1]) / 2 - (GRID_COLS - 1) / 2) * PITCH_X;
            clearRects.push({ x: cxx, z: zHorR, hx: PITCH_X * 0.55, hz: PITCH_Z * 0.5 });  // 走道帶
            clearRects.push({ x: cxx, z: row4C, hx: PITCH_X * 0.55, hz: PITCH_Z * 0.5 });  // 小走道入口
        });
    }
    const addZebra = (cx, cz, axisLen, edgeOff, alongX) => {
        const step = 1.0;
        const n = Math.floor(axisLen / step);
        const startOff = -(axisLen / 2) + 0.5;
        for (let i = 0; i < n; i++) {
            const pos = startOff + i * step;
            [-1, 1].forEach(s => {
                const x = alongX ? cx + pos : cx + s * edgeOff;
                const z = alongX ? cz + s * edgeOff : cz + pos;
                if (clearRects.some(R => x > R.x - R.hx && x < R.x + R.hx && z > R.z - R.hz && z < R.z + R.hz)) return;
                const st = new THREE.Mesh(zebraGeo, zebraMats[i % 2]);
                st.position.set(x, zebraY, z);
                st.rotation.y = alongX ? Math.PI / 2 : 0;   // 長軸沿走道方向
                propGroup.add(st);
            });
        }
    };
    // 橫向人行道（第一條全 W 列）兩側
    addZebra(0, zHorR, GRID_COLS * PITCH_X, PITCH_Z * 0.44, true);
    // 垂直大馬路（最寬走道，貫穿全場）兩側
    addZebra(zbigCx, 0, GRID_ROWS * PITCH_Z, ((zbig[1] - zbig[0]) + 1) * PITCH_X * 0.5 - 0.05, false);
    // 小走道（棧板區範圍）兩側
    {
        const zMid = ((repRow + lastPRow) / 2 - (GRID_ROWS - 1) / 2) * PITCH_Z;
        const zLen = (lastPRow - repRow) * PITCH_Z;
        zruns.slice(1).forEach(rr => {
            const cxx = ((rr[0] + rr[1]) / 2 - (GRID_COLS - 1) / 2) * PITCH_X;
            const halfW = ((rr[1] - rr[0]) + 1) * PITCH_X * 0.5 - 0.05;
            addZebra(cxx, zMid, zLen, halfW, false);
        });
    }

    // 四區廣告牌：立牌說明分區（新版平面圖：C 貨架 / 2FCA / 2FCB / NG・Z）
    // 依 38 列新佈局調整位置：C 在貨架區中央頭側、2FCA/2FCB 在棧板區兩端、NG/Z 在底部
    addZoneSign('C', 0x3d7ec9, 'C 貨架區 (C1-01..15)', -4.5, -24, 0);
    addZoneSign('2FCA', 0xe0a53c, '2FCA 棧板區', -17, 6, 0, false);
    addZoneSign('2FCB', 0x3fae5f, '2FCB 棧板區', 11, 6, 0, false);
    addZoneSign('NG/Z', 0xB06CF7, 'NG 不良品 / Z 暫存區', -10.45, 19.95, 0, false);

    world.add(propGroup);
}

// ==================== 座標地標 A01~A20 / 01~32 ====================
function buildAxisLabels() {
    const halfX = ((GRID_COLS - 1) / 2) * PITCH_X;
    const halfZ = ((GRID_ROWS - 1) / 2) * PITCH_Z;
    const off = 1.7, y = 0.35;
    const group = new THREE.Group();
    // 列地標：棧板區（含 2FCA/2FCB/NG/Z）左側為 B 區、右側為 A 區
    const zRep = FLOOR_PLAN.findIndex(row => row.indexOf('P') >= 0);
    for (let r = zRep; r < GRID_ROWS; r++) {
        if (FLOOR_PLAN[r].indexOf('P') < 0) continue;
        const z = (r - (GRID_ROWS - 1) / 2) * PITCH_Z;
        const aL = makeLabelSprite('B' + pad2(r + 1), null, 1.5, 0.38); aL.position.set(-halfX - off, y, z); group.add(aL);
        const aR = makeLabelSprite('A' + pad2(r + 1), null, 1.5, 0.38); aR.position.set(halfX + off, y, z); group.add(aR);
    }
    // 欄地標：棧板區欄號，只在大馬路重設、分左右；走道不標
    for (let c = 0; c < GRID_COLS; c++) {
        const s = PALLET_COL_SCHEME[c];
        if (!s) continue;
        const x = (c - (GRID_COLS - 1) / 2) * PITCH_X;
        const lbl = pad2(s.no);
        const cF = makeLabelSprite(lbl, null, 1.3, 0.34); cF.position.set(x, y, -halfZ - off); group.add(cF);
        const cB = makeLabelSprite(lbl, null, 1.3, 0.34); cB.position.set(x, y, halfZ + off); group.add(cB);
    }
    world.add(group);
}

// ==================== 區域地標：C倉（大馬路入口處） ====================
function buildZoneLabel() {
    // 標在大馬路（棧板區最寬走道）另一頭入口：列 0（-z 頂邊）
    const repRowZL = FLOOR_PLAN.findIndex(row => row.indexOf('P') >= 0);
    const rowL = FLOOR_PLAN[repRowZL];
    let zst = -1, zbigRun = [0, 0];
    for (let c = 0; c <= GRID_COLS; c++) {
        const isW = (c < GRID_COLS) && rowL[c] === 'W';
        if (isW && zst < 0) zst = c;
        else if (!isW && zst >= 0) { if ((c - 1 - zst) > (zbigRun[1] - zbigRun[0])) zbigRun = [zst, c - 1]; zst = -1; }
    }
    const zx = ((zbigRun[0] + zbigRun[1]) / 2 - (GRID_COLS - 1) / 2) * PITCH_X;
    const zz = -((GRID_ROWS - 1) / 2) * PITCH_Z + 0.6;
    const zl = makeLabelSprite('C 貨架區', '#ffd866', 9.5, 2.3);
    zl.position.set(zx, 0.35, zz);
    zl.raycast = () => {}; // 擋掉光線拾取，避免擋到下方儲位點擊
    propGroup.add(zl);
}

// ==================== 棧板（地板區） ====================
const PALLET_H = 0.12;
const PALLET_W = CELL_W * 0.9;
const PALLET_D = CELL_D * 0.9;
const BOX_SIZE = 0.46;    // 正方體紙箱（快遞箱）尺寸：一層可左右放 2 箱
const BOX_H = BOX_SIZE, BOX_W = BOX_SIZE, BOX_D = BOX_SIZE;
const BOX_GAP = 0.03;     // 箱與箱之間隙
const BOX_STEP = 7;       // 每箱代表 qty 約 7 單位（無限堆疊：qty 越高疊越高）
function boxCount(q) { return Math.max(1, Math.ceil(q / BOX_STEP)); } // 箱數
function cellBoxCount(cell) { return (cell.box_count != null) ? cell.box_count : boxCount(cell.qty); } // 真實箱數優先
const BOX_XOFF = BOX_SIZE * 0.58; // 左右兩箱的中心偏移
const BOX_ZOFF = BOX_SIZE * 0.58; // 前後兩箱的中心偏移（棧板每層 4 箱 2×2）

const T_BOARD = 0.030, STR_H = 0.060, BRD_W = 0.16, BRD_N = 5;
const STR_OFFS = [-0.34, 0, 0.34];
const geoTopB = new THREE.BoxGeometry(BRD_W, T_BOARD, PALLET_D);
const geoBotB = new THREE.BoxGeometry(0.14, T_BOARD, PALLET_D * 0.55);
const geoStr  = new THREE.BoxGeometry(0.10, STR_H, PALLET_D);

function makeWoodTexture() {
    const cvs = document.createElement('canvas');
    cvs.width = cvs.height = 512;
    const ctx = cvs.getContext('2d');
    ctx.fillStyle = '#9c7a45';
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 46; i++) {
        const y = Math.random() * 512;
        ctx.strokeStyle = 'rgba(74,49,22,' + (0.08 + Math.random() * 0.18).toFixed(2) + ')';
        ctx.lineWidth = 1 + Math.random() * 3;
        ctx.beginPath(); ctx.moveTo(0, y); let x = 0;
        while (x < 512) {
            x += 30 + Math.random() * 55;
            ctx.bezierCurveTo(x - 20, y + (Math.random() * 7 - 3.5), x - 5, y + (Math.random() * 7 - 3.5), x, y + (Math.random() * 7 - 3.5));
        }
        ctx.stroke();
    }
    for (let i = 0; i < 20; i++) {
        const y = Math.random() * 512;
        ctx.strokeStyle = 'rgba(219,190,140,' + (0.05 + Math.random() * 0.08).toFixed(2) + ')';
        ctx.lineWidth = 1 + Math.random() * 2;
        ctx.beginPath(); ctx.moveTo(0, y);
        ctx.bezierCurveTo(128, y + Math.random() * 5 - 2.5, 384, y + Math.random() * 5 - 2.5, 512, y);
        ctx.stroke();
    }
    [[90, 90], [400, 330], [180, 460]].forEach(k => {
        ctx.fillStyle = 'rgba(61,40,18,0.5)';
        ctx.beginPath(); ctx.ellipse(k[0], k[1], 26, 11, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(40,26,12,0.5)';
        ctx.beginPath(); ctx.ellipse(k[0], k[1], 11, 5, 0, 0, Math.PI * 2); ctx.fill();
    });
    const tex = new THREE.CanvasTexture(cvs);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.anisotropy = 4;
    return tex;
}
const woodTex = makeWoodTexture();
const woodBaseMat = new THREE.MeshLambertMaterial({ map: woodTex, color: 0xffffff });
const woodRackMat = woodBaseMat.clone();
woodRackMat.color.setHex(0x1c7a43);   // 貨架層板（板子）深綠

function buildSlattedPallet(localGroup, mat) {
    const meshes = [];
    const topY = PALLET_H - T_BOARD / 2;
    const stepX = (PALLET_W - BRD_W) / (BRD_N - 1);
    for (let i = 0; i < BRD_N; i++) {
        const b = new THREE.Mesh(geoTopB, mat);
        b.position.set(-PALLET_W / 2 + BRD_W / 2 + i * stepX, topY, 0);
        b.castShadow = true; meshes.push(b);
    }
    const strY = T_BOARD + STR_H / 2;
    STR_OFFS.forEach(ox => { const st = new THREE.Mesh(geoStr, mat); st.position.set(ox, strY, 0); st.castShadow = true; meshes.push(st); });
    STR_OFFS.forEach(ox => { const bb = new THREE.Mesh(geoBotB, mat); bb.position.set(ox, T_BOARD / 2, 0); bb.castShadow = true; meshes.push(bb); });
    meshes.forEach(m => localGroup.add(m));
    return meshes;
}

// ==================== BUILD CELLS ====================
let cellGroup = null;
const geoBox    = new THREE.BoxGeometry(BOX_W, BOX_H, BOX_D);
const geoRackPlate = new THREE.BoxGeometry(CELL_W * 0.70, 0.06, 1.30);   // 層板縱向長條（深 1.30）
const RACK_BOX = 0.30;                        // 架位小箱（正方形，配合層高 0.45m）
const RACK_ZOFF = 0.32;                       // 前後（Z）兩排偏移
const RACK_XOFF = 0.18;                       // 左右（X）兩排偏移（每層 4 箱：2×2）
const geoRackBox = new THREE.BoxGeometry(RACK_BOX, RACK_BOX, RACK_BOX);

function clearCells() {
    if (cellGroup) scene.remove(cellGroup);
    cellGroup = null;
    cellMeshes = [];
    Object.keys(ghostDyn).forEach(k => ghostDyn[k].length = 0);   // 動態穿透登記重設
    picked = null;
    hovered = null;
    updateSelectedInfo(null);
    selOutline.visible = false;
    if (selBeacon) selBeacon.visible = false;
}

function buildCells(gridData) {
    clearCells();
    cellGroup = new THREE.Group();
    const pitch = BOX_H + BOX_GAP;

    gridData.forEach(cell => {
        const p = gridPos(cell.row, cell.col);
        const entry = { boxes: [], pallet: [], footer: null, woodMat: null, cell: cell, x: p.x, z: p.z, stackMid: 0 };

        if (cell.kind === 'P') {
            // 地板棧板區
            const baseY = 0;
            const g = new THREE.Group();
            g.position.set(p.x, baseY, p.z);
            g.rotation.y = (Math.random() - 0.5) * 0.05;
            g.userData.cat = 'pallet';
            ghostDyn.pallet.push(g);
            const wood = woodBaseMat.clone();
            const s = 0.78 + Math.random() * 0.24;
            wood.color.setRGB(Math.min(1, s), Math.min(1, s * 0.95), Math.min(1, s * 0.80));
            entry.woodMat = wood;
            entry.pallet = buildSlattedPallet(g, wood);   // 空位也是空棧板
            if (cell.state !== 'empty') {
                // 棧板上每層 4 箱（左右 2 × 前後 2），往上疊；顯示真實箱數（上限 24 箱＝6 層，避免爆量）
                const N = Math.min(24, cellBoxCount(cell));
                const perLayer = 4;
                const m = baseMatFor(cell.state);
                for (let k = 1; k <= N; k++) {
                    const layer = Math.floor((k - 1) / perLayer);
                    const slot = (k - 1) % perLayer;
                    const sx = (slot % 2 === 0) ? -1 : 1;   // 左、右
                    const sz = (slot < 2) ? -1 : 1;          // 前排、後排
                    const box = new THREE.Mesh(geoBox, m);
                    box.position.set(sx * BOX_XOFF, PALLET_H + BOX_H / 2 + layer * pitch, sz * BOX_ZOFF);
                    box.castShadow = true;
                    box.userData.cat = 'box';
                    ghostDyn.box.push(box);
                    g.add(box);
                    entry.boxes.push(box);
                }
                const topLayer = Math.floor((N - 1) / perLayer);
                entry.stackMid = PALLET_H + (topLayer * pitch + BOX_H) / 2;
            } else {
                entry.stackMid = PALLET_H / 2;
            }
            cellGroup.add(g);
        } else if (cell.kind === 'R') {
            // 鋼架儲位：每層都有棧板片，空的就放空的（單排 5 層，3 排並排不疊）
            const baseY = (cell.level - 1) * RACK_LVL_H;
            const rg = new THREE.Group();
            rg.position.set(p.x, baseY, p.z);
            rg.userData.cat = 'rack';
            ghostDyn.rack.push(rg);
            const plate = new THREE.Mesh(geoRackPlate, woodRackMat);
            plate.position.set(0, 0.03, 0);
            plate.castShadow = true;
            rg.add(plate);
            entry.pallet.push(plate);
            entry.woodMat = woodRackMat;
            if (cell.state !== 'empty') {
                // 層高 0.45m：單層至多 4 箱（左右 2 × 前後 2），箱數隨真實/模擬箱數變化（拾取後會變少，空了變空格）
                const N = Math.min(4, Math.max(1, cellBoxCount(cell)));
                const m = baseMatFor(cell.state);
                for (let k = 0; k < N; k++) {
                    const sx = (k % 2 === 0) ? -1 : 1;   // 左、右
                    const sz = (k < 2) ? -1 : 1;          // 前排、後排
                    const box = new THREE.Mesh(geoRackBox, m);
                    // 後排墊高半箱高，正面角度也看得到全部 4 箱
                    const y = 0.06 + RACK_BOX / 2 + (k < 2 ? 0 : 0.14);
                    box.position.set(sx * RACK_XOFF, y, sz * RACK_ZOFF);
                    box.castShadow = true;
                    box.userData.cat = 'box';
                    ghostDyn.box.push(box);
                    rg.add(box);
                    entry.boxes.push(box);
                }
                entry.stackMid = baseY + 0.06 + RACK_BOX / 2;
            } else {
                entry.stackMid = baseY + 0.03;
            }
            cellGroup.add(rg);
        }
        cellMeshes.push(entry);
    });

    // 綁定互動
    cellMeshes.forEach(e => {
        const meshes = e.boxes.slice().concat(e.pallet);
        if (e.footer) meshes.push(e.footer);
        meshes.forEach(msh => { msh.userData = { entry: e, cat: msh.userData.cat }; });   // 保留 cat（箱子等）
    });
    world.add(cellGroup);
}

// ==================== 自製上帝視角控制器（拖曳旋轉 / Shift|右鍵平移 / 滾輪縮放 / 自動旋轉） ====================
const simOverlay = new Map();
function effectiveEntries() {
    if (!Array.isArray(liveEntries)) return [];
    return liveEntries.map(cell => {
        const ov = simOverlay.get(cell.location);
        return ov ? Object.assign({}, cell, ov) : cell;
    });
}

// ==================== LOAD ====================
function cPlanCells() {   // 新平面圖碼驅動的 C 倉儲位清單（DB 碼對上才覆蓋庫存）
    const out = [];
    Object.keys(C_CODE_R).forEach(function (col) {
        const cl = parseInt(col, 10);
        C_CODE_R[col].forEach(function (code) {
            const mm = code.match(/-(\d+)$/); if (!mm) return;
            const sfx = parseInt(mm[1], 10), g = Math.ceil(sfx / 5);
            out.push({ state: 'empty', material: '', qty: 0, location: code, row: 2 - (g - 1), col: cl, level: sfx - (g - 1) * 5, rackGroup: g, kind: 'R' });
        });
    });
    Object.keys(C_CODE_P).forEach(function (key) {
        const pp = key.split(',');
        out.push({ state: 'empty', material: '', qty: 0, location: C_CODE_P[key], row: +pp[0], col: +pp[1], level: 1, rackGroup: 1, kind: 'P' });
    });
    return out;
}
function loadData(isManual) {
    const byCode = {};
    effectiveEntries().forEach(function (c) { const k = normCode(c.location); if (k) byCode[k] = c; });
    const gridData = cPlanCells().map(function (b) {   // 真實資料 overlay：碼對上才灌庫存狀態
        const l = byCode[normCode(b.location)];
        return l ? Object.assign({}, b, { state: l.state, material: l.material, qty: l.qty, box_count: l.box_count, boxes: l.boxes, item: l.item, itemnm: l.itemnm }) : b;
    });
    lastGridData = gridData;
    if (!renderer) return;
    buildCells(gridData);
    setWhVisible(activeWh);   // 資料重建後維持目前選倉可見性（C 也會被隱藏）
    renderSummary(gridData);
    if (currentWH === 'D' && typeof renderDWSummary === 'function') renderDWSummary();   // 在 D 倉時 refresh 後仍顯示 D 統計
    if (isManual) {
        const btn = document.getElementById('btnRefresh');
        btn.textContent = '已更新 ✔';
        setTimeout(() => { btn.textContent = '重新整理'; }, 900);
    }
}

// ==================== A 倉（平面圖：Denah terbaru store，107×54；19 行以上=貨架 R、以下=SMT 圓盤料架 P、19 行=鐵籠 C） ====================
// 由 Denah terbaru store.xlsx 自動產生（107 欄 × 54 列；19 行以上=貨架 R，以下=棧板 P，19 行=鐵籠 C） W柱子
const TV_W = 3 * PITCH_X, TV_H = TV_W * 9 / 16;   // 電視寬＝大馬路(人行道)3欄寬；16:9
