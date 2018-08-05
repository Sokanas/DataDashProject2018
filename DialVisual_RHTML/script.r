source('./r_files/flatten_HTML.r')

############### Library Declarations ###############
libraryRequireInstall("ggplot2")
libraryRequireInstall("plotly")
libraryRequireInstall("htmlwidgets")
libraryRequireInstall("XML")
####################################################

################### Actual code ####################
#g = qplot(`Petal.Length`, data = iris, fill = `Species`, main = Sys.time());

waitForData = FALSE
if(!exists("dataset"))
    waitForData = TRUE

#this is the value to put the indicator
guageValue = 80
maxValue = 100
minValue = 0
guageVariance = (guageValue / (maxValue - minValue)) * 100
#mid point values for SVG Path
h = 0.8
k = 0.5
r = 0.14

#Value into degrees, then into radians
theta = guageVariance * 180 / 360
theta = theta * pi / 180

#calc the x,y position of the point
x = h + r*cos(theta)
y = k + r*sin(theta)

#create the path string
builder <- c('M 0.5 0.5 L', toString(x), toString(y), 'L 0.5 0.5 Z')
pathString = paste(builder, collapse=' ')

#Draw the Guage 
base_plot <- plot_ly(
    type = "pie",
    values = c(40,10,10,10,10),
    labels = c("-","","","",""),
    rotation=108,
    direction="clockwise",
    hole=0.5,
    textinfo="label",
    textposition="outside",
    hoverinfo="none",
    domain=list(x=c(0,1), y=c(0,1)),
    marker=list(colors =  c('rgb(255, 255, 255)', 'rgb(255, 255, 255)', 'rgb(255, 255, 255)', 'rgb(255, 255, 255)', 'rgb(255, 255, 255)', 'rgb(255, 255, 255)', 'rgb(255, 255, 255)')),
    showlegend = FALSE
)

base_plot <- add_trace(
    base_plot,
    type="pie",
    values=c(50,10,10,10,10,10),
    labels=c("","","","","",""),
    rotation=90,
    direction="clockwise",
    hole=0.7,
    textinfo="label",
    textposition="inside",
    hoverinfo="none",
    domain=list(x=c(0,1), y=c(0,1)),
    marker=list(colors = c('rgb(255, 255, 255)', 'rgb(232,226,202)', 'rgb(226,210,172)', 'rgb(223,189,139)', 'rgb(223,162,103)', 'rgb(226,126,64)')),
    showlegend= FALSE
)

a <- list(
    xref = 'paper',
    yref = 'paper',
    x = 0.5,
    y = 0.45,
    showarrow=FALSE,
    text='50'
)

b <- list(
    xref='paper',
    yref='paper',
    x=0.5,
    y=0.45,
    showarrow=FALSE,
    text=guageValue
)

base_chart <- layout(
    base_plot,
    shapes = list(
        list(
            type='path',
            path=pathString,
            xref='paper',
            yref='paper',
            fillcolour = 'rgba(44, 160, 101, 0.5)'
        )
    ),
    #xaxis = a,
    #yaxis = a,
    annotations = b
)
base_chart

remove(dataset)

####################################################

############# Create and save widget ###############
#p = ggplotly(g);
internalSaveWidget(base_chart, 'out.html');
####################################################
