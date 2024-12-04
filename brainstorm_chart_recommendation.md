chart recommendation decision tree
column types, Q,N,O,T

1 COLUMNS
Q - histogram, or maybe CDF
T - histogram
N - bar chart of counts sorted large to small
O - bar chart of counts sorted ordinally

2 COLUMNS
Q Q - scatterplot, or heatmap if lots of data, or maybe 2 histograms or 2 CDFs
Q N - - if 1:1 mapping of Q:N then bar chart sorted large to small - if multiple Q for 1 N then violin plot facet by N, sorted by mean large to small
Q O - same as QN but sort ordinally
N N - Stacked bar chart of counts sorted large to small, or heatmap of counts sorted w/ clustering
N O - Same as N N, but sort by O
O O - Same as N N, but sort by O O

3 COLUMNS
QQQ
QQN
QQO
QNN
QNO
Q

Basic chart rec for just Q,N

1 COLUMN
Q - histogram
N - bar chart

2 COLUMN
QQ - scatterplot (maybe w/ dist on axes)
QN/NQ - if 1:1 then bar chart, otherwise, violin plots
NN - stacked bar chart, or maybe heatmap
