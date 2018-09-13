library(remotes)
library(magrittr)
install_github('FrissAnalytics/shinyJsTutorials/widgets/C3')
#install_github("mrjoh3/c3")
library(c3) #won't install the C3 Library -- this would be the best if we could get it operational
library(shiny)

runApp(list(
  ui = bootstrapPage(
    # example use of the automatically generated output function
    column(6,C3GaugeOutput("gauge1"))
  ),
  server = function(input, output) {
    
    # reactive that generates a random value for the gauge
    value = reactive({
      invalidateLater(1000)
      round(runif(1,0,100),2)
    })
    
    # example use of the automatically generated render function
    output$gauge1 <- renderC3Gauge({ 
      # C3Gauge widget
      C3Gauge(value())
    })
  }
))










