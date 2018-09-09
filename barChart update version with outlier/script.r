source('./r_files/flatten_HTML.r')

############### Library Declarations ###############
libraryRequireInstall("ggplot2");
libraryRequireInstall("plotly");
libraryRequireInstall("htmlwidgets");
####################################################

################### Actual code ####################
dataFrame <- data.frame(Axis, Values[[1]]);

columns = ncol(Values);

#Checking if colour and Threshold Colouring have been set, and setting defaults if not
baseColour = "#FD625E"
thresholdActive = FALSE;
if(exists("ColourSettings_fill")){
	baseColour = as.character(ColourSettings_fill);
}
if(exists("ColourSettings_thresholdActive")){
	thresholdActive = as.logical(ColourSettings_thresholdActive);
}

#Threshold Colouring
if(thresholdActive){

	#Checking if colours and thresholds have been set, and setting defaults if not
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
	
	thresholds <- c(-Inf, threshold1Value, threshold2Value, Inf);
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
        }
    }
	p <- plot_ly(
			marker = list(color = colours),
	)
	for(cols in 1:ncol(Values)){
		rgbvals = col2rgb(baseColour);
		rgbvals[1] = max(0, rgbvals[1] - (15 * (cols-1)));
		rgbvals[2] = max(0, rgbvals[2] - (15 * (cols-1)));
		rgbvals[3] = max(0, rgbvals[3] - (15 * (cols-1)));
		baseColour = rgb(rgbvals[1], rgbvals[2], rgbvals[3], maxColorValue = 255);
		rgbvals = col2rgb(threshold1Colour);
		rgbvals[1] = max(0, rgbvals[1] - (15 * (cols-1)));
		rgbvals[2] = max(0, rgbvals[2] - (15 * (cols-1)));
		rgbvals[3] = max(0, rgbvals[3] - (15 * (cols-1)));
		threshold1Colour = rgb(rgbvals[1], rgbvals[2], rgbvals[3], maxColorValue = 255);
		rgbvals = col2rgb(threshold2Colour);
		rgbvals[1] = max(0, rgbvals[1] - (15 * (cols-1)));
		rgbvals[2] = max(0, rgbvals[2] - (15 * (cols-1)));
		rgbvals[3] = max(0, rgbvals[3] - (15 * (cols-1)));
		threshold2Colour = rgb(rgbvals[1], rgbvals[2], rgbvals[3], maxColorValue = 255);c
		colours <- c(baseColour,threshold1Colour,threshold2Colour)[findInterval(Values[[cols]], vec=thresholds)]
		if(cols == 1){
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
        }
    }
			p <- plot_ly(Values,
				x = dataFrame[[1]],
				y = dataFrame[[2]],
				type = "bar",
				name=colnames(Values)[[cols]],
				marker = list(color = colours)
				
			)%>%
	        rangeslider(dataFrame$x[10], dataFrame$x[100000])
			
		}else{
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
        }
    }
			p <- add_bars(p,
				x=dataFrame[[1]],
				y=Values[[cols]],
				data=Values,
				name=colnames(Values)[[cols]],
				marker = list(color = colours),
				evaluate = TRUE
				
			)%>%
	        rangeslider(dataFrame$x[10], dataFrame$x[100000])
			
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
        }
    }
	for(cols in 1:ncol(Values)){
		rgbvals = col2rgb(baseColour);
		rgbvals[1] = max(0, rgbvals[1] - (15 * (cols-1)));
		rgbvals[2] = max(0, rgbvals[2] - (15 * (cols-1)));
		rgbvals[3] = max(0, rgbvals[3] - (15 * (cols-1)));
		baseColour = rgb(rgbvals[1], rgbvals[2], rgbvals[3], maxColorValue = 255);
		if(cols == 1){
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
        }
    }
			p <- plot_ly(Values,
				x = dataFrame[[1]],
				y = dataFrame[[2]],
				type = "bar",
				name=colnames(Values)[[cols]],
				marker = list(color = baseColour)
				
			)%>%
	        rangeslider(dataFrame$x[10], dataFrame$x[100000])
			
		}else{
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
        }
    }
			p <- add_bars(p,
				x=dataFrame[[1]],
				y=Values[[cols]],
				data=Values,
				name=colnames(Values)[[cols]],
				marker = list(color = baseColour),
				evaluate = TRUE
			)%>%
	        rangeslider(dataFrame$x[10], dataFrame$x[100000])

			
		}
	}
}

####################################################

############# Create and save widget ###############
internalSaveWidget(p, 'out.html');
####################################################
