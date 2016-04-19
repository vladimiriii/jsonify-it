import pandas as pd

import sys
if sys.version_info[0] < 3:
    from StringIO import StringIO
else:
    from io import StringIO

CSV_Data = "Index,Column_1,Column_2,Column_3,Column_4,Column_5,Column_6,Column_7,Column_8\nindex_1,1.12345678999123456,1.2,1.3,1.4,1.5,1.6,1.7,1.8\nindex_2,2.1,2.2,2.3,2.4,2.5,2.6,2.7,2.8\nindex_3,3.1,3.2,3.3,3.4,3.5,3.6,3.7,3.8\nindex_4,4.1,4.2,4.3,4.4,4.5,4.6,4.7,4.8"

input_data = StringIO(CSV_Data)
df = pd.DataFrame.from_csv(path = input_data, header = 0, sep=',', index_col=0, encoding='utf-8')
array = df.to_dict(orient = 'records')
print(pd.io.json.dumps(array))