source('./r_files/flatten_HTML.r')

############### Library Declarations ###############
libraryRequireInstall("ggplot2");
libraryRequireInstall("plotly");
libraryRequireInstall("magrittr")
libraryRequireInstall("dplyr")

####################################################

################### Actual code ####################
dataFrame <- data.frame(Label, Values[[1]]);
#dataFrame <- sapply(strsplit(rownames(dataFrame), " "), "[[", 1);



####################################################
p <- dataFrame %>%
  group_by(dataFrame[[1]]) %>%
  summarize(count = n()) %>%
  plot_ly(labels = ~dataFrame[[1]], values = ~dataFrame[[2]]) %>%
  add_pie(hole = 0.6) %>%
  layout(title = "Donut chart",  showlegend = F,
         xaxis = list(showgrid = FALSE, zeroline = FALSE, showticklabels = FALSE),
         yaxis = list(showgrid = FALSE, zeroline = FALSE, showticklabels = FALSE))


############# Create and save widget ###############
internalSaveWidget(p, 'out.html');
####################################################
