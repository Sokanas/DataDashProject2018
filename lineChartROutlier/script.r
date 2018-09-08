source('./r_files/flatten_HTML.r')

############### Library Declarations ###############
libraryRequireInstall("ggplot2");
libraryRequireInstall("plotly");
libraryRequireInstall("htmlwidgets");
libraryRequireInstall("dplyr");
####################################################

################### Actual code ####################
dataFrame <- data.frame(Axis, Values[[1]]);


#dataFrame[[1]] <- factor(dataFrame[[1]], levels = dataFrame[[1]]) #Forces data to sort by original order. Turns out to be unnecessary

#Checking if colour and Threshold Colouring have been set, and setting defaults if not
lineColour = "#01B8AA";
reds = c("#7f312f","#be4a47","#FD625E","#fd817e","#fea19e","#fec0bf");
greens = c("#015c55","#018a80","#01B8AA","#34c6bb","#67d4cc","#99e3dd");
slates = c("#1c2325","#293537","#374649","#5f6b6d","#879092","#afb5b6");
yellows = c("#796408","#b6960b","#F2C80F","#f5d33f","#f7de6f","#fae99f");
greys = c("#303637","#475052","#5F6B6D","#7f898a","#9fa6a7","#bfc4c5");
blues = c("#456a76","#689fb0","#8AD4EB","#a1ddef","#b9e5f3","#d0eef7");
oranges = c("#7f4b33","#bf714d","#FE9666","#feab85","#fec0a3","#ffd5c2");
purples = c("#53354d","#7d4f73","#A66999","#b887ad","#caa5c2","#dbc3d6");
blacks = c("#000000","#1a1a1a","#333333","#4a4a4a","#666666","#999999");
colours = reds;
colourFound = FALSE;
thresholdActive = FALSE;
if(exists("ColourSettings_fill")){
	lineColour = as.character(ColourSettings_fill);
}
if(exists("ColourSettings_thresholdActive")){
	thresholdActive = as.logical(ColourSettings_thresholdActive);
}

#Setting colours for multiple lines by iterating through the PowerBI presets of the same shade
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

	min = min(dataFrame[[2]]);
	max = max(dataFrame[[2]]);
	for(cols in 1:ncol(Values)){

		if(min(Values[[cols]]) < min){
		min = min(Values[[cols]]);	
		}		
		if(max(Values[[cols]]) > max){
		max = max(Values[[cols]]);	
		}

	}


	for(cols in 1:ncol(Values)){

		if(exists("OutlierSettings_outlieractive")){
				outlieractive = as.logical(OutlierSettings_outlieractive);
				if(outlieractive){
			
					iqr1 = IQR(Values[[cols]]);
					min1 = min(Values[[cols]]) + iqr1;
					max1 = max(Values[[cols]]) - iqr1;
					for (vals in 1:nrow(Values)){
						if(Values[[cols]][[vals]] > max1){
							Values[[cols]] <- replace(Values[[cols]], vals, (max + 1));
						}	
						if(Values[[cols]][[vals]] < min1){
							Values[[cols]] <- replace(Values[[cols]], vals, (min - 1));
						}	
					}
				}
		}

	}

	#Checking if colours and thresholds have been set, and setting defaults if not
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
	
	if(threshold2Value < threshold1Value){
		threshold2Value = threshold1Value;
	}
	thresholds <- c(-Inf, threshold1Value, threshold2Value, Inf);
	
	#Create lines for thresholds
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
	for(cols in 1:ncol(Values)){
		markercolours <- c(threshold0Colour,threshold1Colour,threshold2Colour)[findInterval(Values[[cols]], vec=thresholds)];
		if(cols == 1){

			if(exists("OutlierSettings_outlieractive")){
				outlieractive = as.logical(OutlierSettings_outlieractive);
				if(outlieractive){
					
					iqr1 = IQR(dataFrame[[2]]);
					min1 = min(dataFrame[[2]]) + iqr1;
					max1 = max(dataFrame[[2]]) - iqr1;
					for (vals in 1:nrow(Values)){
						if(dataFrame[[2]][[vals]] > max1){
							dataFrame[[2]] <- replace(dataFrame[[2]], vals, (max + 1));
						}	
						if(dataFrame[[2]][[vals]] < min1){
							dataFrame[[2]] <- replace(dataFrame[[2]], vals, (min -1));
						}	
					}

				}
			}

			p <- add_trace(p,
			x = dataFrame[[1]],
			y = dataFrame[[2]],
			type = "scatter",
			mode = "lines+markers",
			marker = list(color = markercolours),
			line = list(color = colours[[cols]]),
			name=colnames(Values)[[cols]],
			transforms = list(
				list(
						type = 'filter',
						target = 'y',
						operation = '<=',
						value = max 
					),
				list(
						type = 'filter',
						target = 'y',
						operation = '>=',
						value = min
					)
			),
			showlegend = TRUE)%>%
			layout(margin = list(l = 50, r = 50, b = 150, t = 50, pad = 4));
		}else{
			p <- add_trace(p,
				x=dataFrame[[1]],
				y=Values[[cols]],
				data=Values,
				type = "scatter",
				mode = "lines+markers",
				name=colnames(Values)[[cols]],
				showlegend = TRUE,
				marker = list(color = markercolours),
				transforms = list(
					list(
							type = 'filter',
							target = 'y',
							operation = '<=',
							value = max 
						),
					list(
							type = 'filter',
							target = 'y',
							operation = '>=',
							value = min
						)
				),
				line = list(color = colours[[if(cols %% 6 == 0) 6 else cols %% 6]])#,
				#evaluate = TRUE
			)
		}
	}
}else{ #No Threshold Colouring

	min = min(dataFrame[[2]]);
	max = max(dataFrame[[2]]);
	for(cols in 1:ncol(Values)){

		if(min(Values[[cols]]) < min){
		min = min(Values[[cols]]);	
		}		
		if(max(Values[[cols]]) > max){
		max = max(Values[[cols]]);	
		}

	}


	for(cols in 1:ncol(Values)){

		if(exists("OutlierSettings_outlieractive")){
				outlieractive = as.logical(OutlierSettings_outlieractive);
				if(outlieractive){
			
					iqr1 = IQR(Values[[cols]]);
					min1 = min(Values[[cols]]) + iqr1;
					max1 = max(Values[[cols]]) - iqr1;
					for (vals in 1:nrow(Values)){
						if(Values[[cols]][[vals]] > max1){
							Values[[cols]] <- replace(Values[[cols]], vals, (max + 1));
						}	
						if(Values[[cols]][[vals]] < min1){
							Values[[cols]] <- replace(Values[[cols]], vals, (min - 1));
						}	
					}
				}
		}

	}		


	for(cols in 1:ncol(Values)){
	

		if(cols == 1){
			
			if(exists("OutlierSettings_outlieractive")){
				outlieractive = as.logical(OutlierSettings_outlieractive);
				if(outlieractive){
					
					iqr1 = IQR(dataFrame[[2]]);
					min1 = min(dataFrame[[2]]) + iqr1;
					max1 = max(dataFrame[[2]]) - iqr1;
					for (vals in 1:nrow(Values)){
						if(dataFrame[[2]][[vals]] > max1){
							dataFrame[[2]] <- replace(dataFrame[[2]], vals, (max + 1));
						}	
						if(dataFrame[[2]][[vals]] < min1){
							dataFrame[[2]] <- replace(dataFrame[[2]], vals, (min -1));
						}	
					}

				}
			}

			

			p <- plot_ly(Values,
			x = dataFrame[[1]],
			y = dataFrame[[2]],
			type = "scatter",
			mode = "lines+markers",
			marker = list(color = colours[[cols]]),
			line = list(color = colours[[cols]]),
			showlegend = TRUE,
			transforms = list(
				list(
						type = 'filter',
						target = 'y',
						operation = '<=',
						value = max 
					),
				list(
						type = 'filter',
						target = 'y',
						operation = '>=',
						value = min
					)
			),			
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
				showlegend = TRUE,
				marker = list(color = colours[[cols]]),
				line = list(color = colours[[cols]]),	
				transforms = list(
					list(
						type = 'filter',
						target = 'y',
						operation = '<=',
						value = max 
					),
					list(
						type = 'filter',
						target = 'y',
						operation = '>=',
						value = min 
					)
				),			
				evaluate = TRUE
			)
		}
	}
}

####################################################

############# Create and save widget ###############
internalSaveWidget(p, 'out.html');
####################################################
