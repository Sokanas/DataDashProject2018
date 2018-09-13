source('./r_files/flatten_HTML.r')

############### Library Declarations ###############
libraryRequireInstall("XML")
libraryRequireInstall("remotes")
libraryRequireInstall("magrittr")
install_github("mrjoh3/c3")
install_github("dreamRs/billboarder")
libraryRequireInstall("c3")
libraryRequireInstall("shiny")
libraryRequireInstall("billboarder")
####################################################

################### Actual code ####################
#g = qplot(`Petal.Length`, data = iris, fill = `Species`, main = Sys.time());

#value = 74

#data.frame(data = Values) %>% 
#  c3() %>% 
#  c3_gauge(threshold=list(unit="percent", max=100, values=c(50,75,100)), pattern=c('red','yellow', 'green'))


  base_chart <- billboarder() %>%
  bb_gaugechart(value = Values) %>% 
  bb_gauge(min = 0, max = 100, threshold=list(unit="percent", max=100, values=c(50,75,100)), 
           pattern=c('red','yellow', 'green'), label = list(format = htmlwidgets::JS("function(value) {return value;}")))

####################################################

############# Create and save widget ###############
#p = ggplotly(g);
internalSaveWidget(base_chart, 'out.html');
####################################################
