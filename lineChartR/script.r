source('./r_files/flatten_HTML.r')

############### Library Declarations ###############
libraryRequireInstall("ggplot2");
libraryRequireInstall("plotly");
libraryRequireInstall("htmlwidgets");
####################################################

################### Actual code ####################
#Import the data from PowerBI
dataFrame <- data.frame(Axis, Values[[1]]);

#dataFrame[[1]] <- factor(dataFrame[[1]], levels = dataFrame[[1]]) #Forces data to sort by original order. Turns out to be unnecessary, left commented here in case it becomes useful

#Checking if colour and Threshold Colouring have been set, and setting defaults if not
lineColour = "#01B8AA";
#set the colors that can be used in options
reds = c("#7f312f","#be4a47","#FD625E","#fd817e","#fea19e","#fec0bf");
greens = c("#015c55","#018a80","#01B8AA","#34c6bb","#67d4cc","#99e3dd");
slates = c("#1c2325","#293537","#374649","#5f6b6d","#879092","#afb5b6");
yellows = c("#796408","#b6960b","#F2C80F","#f5d33f","#f7de6f","#fae99f");
greys = c("#303637","#475052","#5F6B6D","#7f898a","#9fa6a7","#bfc4c5");
blues = c("#456a76","#689fb0","#8AD4EB","#a1ddef","#b9e5f3","#d0eef7");
oranges = c("#7f4b33","#bf714d","#FE9666","#feab85","#fec0a3","#ffd5c2");
purples = c("#53354d","#7d4f73","#A66999","#b887ad","#caa5c2","#dbc3d6");
blacks = c("#000000","#1a1a1a","#333333","#4a4a4a","#666666","#999999");
#coloursAll = c("#FD625E","#01B8AA","#374649","#F2C80F","#5F6B6D","#8AD4EB","#FE9666","#A66999","#333333","#fea19e","#67d4cc","#879092","#f7de6f","#9fa6a7","#b9e5f3","#fec0a3","#caa5c2","#666666","#7f312f","#015c55","#1c2325","#796408","#303637","#456a76","#7f4b33","#53354d","#000000");
colours = reds;
colourFound = FALSE;
thresholdActive = FALSE; # threshold is close in the default property
legendActive = TRUE; #The default property of the function is true, indicating that the default is to open this option.

#an optional object defining how Class is extended by the class of the object. This argument is used internally
#the returned object must be strictly from the target class
if(exists("ColourSettings_fill")){
	lineColour = as.character(ColourSettings_fill);
}
if(exists("ColourSettings_thresholdActive")){
	thresholdActive = as.logical(ColourSettings_thresholdActive);
}
if(exists("Legend_legendActive")){
	legendActive = as.logical(Legend_legendActive);
}

#Setting colours for multiple lines by iterating through the PowerBI presets of the same shade
#Determine the establishment of coordinates and data in any color case, and initial creation of the graph object
if(colourFound == FALSE){
	if(lineColour %in% reds){
		p <- plot_ly(Values);
		colourFound == TRUE;
		index = match(lineColour, reds) - 1;
		if(index == 0){
			colours = reds;
		}else{
			colours = c(tail(reds, -(index)), head(reds, index));
		}
	}else if(lineColour %in% greens){
		p <- plot_ly(Values);
		colourFound == TRUE;
		index = match(lineColour, greens) - 1;
		if(index == 0){
			colours = greens;
		}else{
			colours = c(tail(greens, -(index)), head(greens, index));
		}
	}else if(lineColour %in% slates){
		p <- plot_ly(Values);
		colourFound == TRUE;
		index = match(lineColour, slates) - 1;
		if(index == 0){
			colours = slates;
		}else{
			colours = c(tail(slates, -(index)), head(slates, index));
		}
	}else if(lineColour %in% yellows){
		p <- plot_ly(Values);
		colourFound == TRUE;
		index = match(lineColour, yellows) - 1;
		if(index == 0){
			colours = yellows;
		}else{
			colours = c(tail(yellows, -(index)), head(yellows, index));
		}
	}else if(lineColour %in% greys){
		p <- plot_ly(Values);
		colourFound == TRUE;
		index = match(lineColour, greys) - 1;
		if(index == 0){
			colours = greys;
		}else{
			colours = c(tail(greys, -(index)), head(greys, index));
		}
	}else if(lineColour %in% blues){
		p <- plot_ly(Values);
		colourFound == TRUE;
		index = match(lineColour, blues) - 1;
		if(index == 0){
			colours = blues;
		}else{
			colours = c(tail(blues, -(index)), head(blues, index));
		}
	}else if(lineColour %in% oranges){
		p <- plot_ly(Values);
		colourFound == TRUE;
		index = match(lineColour, oranges) - 1;
		if(index == 0){
			colours = oranges;
		}else{
			colours = c(tail(oranges, -(index)), head(oranges, index));
		}
	}else if(lineColour %in% purples){
		p <- plot_ly(Values);
		colourFound == TRUE;
		index = match(lineColour, purples) - 1;
		if(index == 0){
			colours = purples;
		}else{
			colours = c(tail(purples, -(index)), head(purples, index));
		}
	}else if(lineColour %in% blacks){
		p <- plot_ly(Values);
		colourFound == TRUE;
		index = match(lineColour, blacks) - 1;
		if(index == 0){
			colours = blacks;
		}else{
			colours = c(tail(blacks, -(index)), head(blacks, index));
		}
	}else{
		p <- plot_ly(Values);
		colours = c(lineColour,lineColour,lineColour,lineColour,lineColour,lineColour);
	}
}
#Threshold Colouring
if(thresholdActive){

	#Checking if colours and thresholds have been set, and setting defaults if not
	if(exists("ColourSettings_linesActive")){
		linesActive = as.logical(ColourSettings_linesActive);
	}else{
		linesActive = FALSE;
	}
	if(exists("ColourSettings_colour0")){
		threshold0Colour = as.character(ColourSettings_colour0);
	}else{
		threshold0Colour = "#FD625E";
	}
	if(exists("ColourSettings_threshold1")){
		threshold1Value = ColourSettings_threshold1;
	}else{
		threshold1Value = 40;
	}
	if(exists("ColourSettings_colour1")){
		threshold1Colour = as.character(ColourSettings_colour1);
	}else{
		threshold1Colour = "#F2C80F";
	}
	if(exists("ColourSettings_threshold2")){
		threshold2Value = ColourSettings_threshold2;
	}else{
		threshold2Value = 70;
	}
	if(exists("ColourSettings_colour2")){
		threshold2Colour = as.character(ColourSettings_colour2);
	}else{
		threshold2Colour = "#01B8AA";
	}
	
	#Represents the scope of the thresholds color function call.
	thresholds <- c(-Inf, threshold1Value, threshold2Value, Inf);
	
	#Create lines for thresholds if enabled
	if(linesActive){
		# create the first line
		p <- add_trace(p,
			x=dataFrame[[1]],
			y=threshold1Value,
			type = "scatter",
			name="Threshold 1",
			showlegend = FALSE,
			mode = "lines",
			line = list(color = "#000000"),
			evaluate = TRUE
		)
		# create the second line
		p <- add_trace(p,
			x=dataFrame[[1]],
			y=threshold2Value,
			type = "scatter",
			name="Threshold 2",
			showlegend = FALSE,
			mode = "lines",
			line = list(color = "#000000"),
			evaluate = TRUE
		)
	}

	for(cols in 1:ncol(Values)){
		markercolours <- c(threshold0Colour,threshold1Colour,threshold2Colour)[findInterval(Values[[cols]], vec=thresholds)];
		if(cols == 1){
			p <- add_trace(p,
			x = dataFrame[[1]],
			y = dataFrame[[2]],
			type = "scatter",
			mode = "lines+markers",
			marker = list(color = markercolours),
			line = list(color = colours[[cols]]),
			name=colnames(Values)[[cols]],
			showlegend = legendActive)%>%
			layout(margin = list(l = 50, r = 50, b = 150, t = 50, pad = 4));
		}else{
			p <- add_trace(p,
				x=dataFrame[[1]],
				y=Values[[cols]],
				data=Values,
				type = "scatter",
				mode = "lines+markers",
				name=colnames(Values)[[cols]],
				showlegend = legendActive,
				marker = list(color = markercolours),
				line = list(color = colours[[if(cols %% 6 == 0) 6 else cols %% 6]])
			)
		}
	}
}else{ #No Threshold Colouring
	for(cols in 1:ncol(Values)){
		if(cols == 1){
			p <- plot_ly(Values,
			x = dataFrame[[1]],
			y = dataFrame[[2]],
			type = "scatter",
			mode = "lines+markers",
			marker = list(color = colours[[cols]]),
			line = list(color = colours[[cols]]),
			showlegend = legendActive,
			name=colnames(Values)[[cols]])%>%
			layout(margin = list(l = 50, r = 50, b = 150, t = 50, pad = 4));
		}else{
			p <- add_trace(p,
				x=dataFrame[[1]],
				y=Values[[cols]],
				data=Values,
				type = "scatter",
				mode = "lines+markers",
				name=colnames(Values)[[cols]],
				showlegend = legendActive,
				marker = list(color = colours[[cols]]),
				line = list(color = colours[[if(cols %% 6 == 0) 6 else cols %% 6]])
			)
		}
	}
}

####################################################

############# Create and save widget ###############
internalSaveWidget(p, 'out.html');
####################################################
