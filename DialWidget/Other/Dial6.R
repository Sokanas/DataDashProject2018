
############### Library Declarations ###############
library("XML")
library("remotes")
library("magrittr")
install_github("mrjoh3/c3")
install_github("dreamRs/billboarder")
library("c3")
library("shiny")
library("billboarder")
####################################################

################### Actual code ####################
#g = qplot(`Petal.Length`, data = iris, fill = `Species`, main = Sys.time());

#value = 74

#data.frame(data = Values) %>% 
#  c3() %>% 
#  c3_gauge(threshold=list(unit="percent", max=100, values=c(50,75,100)), pattern=c('red','yellow', 'green'))

  billboarder() %>%
  bb_gaugechart(value = 74) %>% 
  bb_gauge(min = 0, max = 100, threshold=list(unit="percent", max=100, values=c(50,75,100)), 
           pattern=c('red','yellow', 'green'), label = list(format = htmlwidgets::JS("function(value) {return value;}")))
  

#bb_gaugechart(threshold=list(unit="percent", max=100, values=c(50,75,100)), pattern=c('red','yellow', 'green'))

####################################################

############# Create and save widget ###############
#p = ggplotly(g);
####################################################
