library(dplyr)
library(jsonlite)

nodes<-read.csv('ResNet pub matrix names.csv')
links<-read.csv('ResNet links18-21.csv')
nodes$id<-seq(1,nrow(nodes))
links_names <- links |> left_join(nodes, by=c('member_id1'='member_id')) |> left_join(nodes, by=c('member_id2'='member_id')) |> select(source=id.x, target=id.y, year, value=number_of_papers)
nodes_names <- nodes |> mutate(name=paste(team,Name,sep='.')) |> select(name,group=team,id)
out<-list(nodes=nodes_names,links=links_names)

js<-jsonlite::toJSON(out,matrix('rowmajor'),dataframe='rows')

fileConn<-file("collab-data.js")
writeLines(paste0('var graph=',js), fileConn)
close(fileConn)

