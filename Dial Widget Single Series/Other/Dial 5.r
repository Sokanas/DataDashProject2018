library(remotes)
library(magrittr)
#install_github('FrissAnalytics/shinyJsTutorials/widgets/C3')
install_github("mrjoh3/c3")
library(c3) #won't install the C3 Library -- this would be the best if we could get it operational
library(shiny)


data.frame(data = 74) %>% 
  c3() %>% 
  c3_gauge(threshold=list(unit="percent", max=100, values=c(50,75,100)), pattern=c('red','yellow', 'green'))

