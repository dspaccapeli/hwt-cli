const React = require('react');
const { useState, useEffect } = require('react');
const { Box, Text, useApp, useInput, Newline, render } = require('ink');
const { default: Spinner } = require('ink-spinner');
const { execaCommand } = require("@esm2cjs/execa");
const clipboard = require('clipboardy');
const TextInput = require('ink-text-input').default;
const { Configuration, OpenAIApi } = require("openai");

var basePrompt = `
Write a command line shell script to perform the following commands.
Ask: stop all the running containers and delete the images and cache
$: docker stop $(docker ps -aq)
docker system prune -af --volumes
Ask: add a '.png' to all the image files in this folder
$: for file in /path/to/folder/*.{jpg,jpeg,png}; do mv "\$file" "\${file%.*}.png"; done
Ask: I have png images from 0000.png through 0120.png. I want to use ffmpeg to convert them into an mp4 video. The images have an alpha channel, I would like the alpha channel to be composited to the right side of the rb channels, so that the video has double the width of the input images, with the rgb on the left half and the alpha on the right half. The alpha should be represented as black for 100% transparent and white for 0% transparent.
$: ffmpeg - framerate 24 - 1 %04d.png -vf "split [rgb] [a];[rgb]setpts-PTS-STARTPTS (rgb]: [a]alphaextract, format=gray[alpha];[rgb] [alpha]hstack" -c:v libx264 -crf 23 -preset veryfast output.mp4
Ask: list all the wifi networks in mac os
$: networksetup -listallhardwareports
Ask: create a new virtual environment called 'ml' in python and install pytorch in it
$: python3 -m venv ml
source ml/bin/activate
pip install torch torchvision
Ask: {query}
$:
`;

const DisplayExecutionComponent = ({result, autoCopy}) => {
    result = result.split('\n');
    const [query, setQuery] = useState(result);
    const [focusedIndex, setFocusedIndex] = useState(0);
    const [executedIndex, setExecutedIndex] = useState([]);
    const [cmdOutput, setCmdOutput] = useState('');
    const [hasFinished, setHasFinished] = useState(false);
    
    const {exit} = useApp();

    // find closest index of the query array that is not executed
    const findClosestIndex = (index, direction) => {
        if (executedIndex.includes(index)) {
            if (direction === 'up') {
                if (index === 0) {
                    return findClosestIndex(index, 'down');
                }
                return findClosestIndex(index - 1, direction);
            } else if (direction === 'down') {
                if (index === query.length - 1) {
                    return findClosestIndex(index, 'up');
                }
                return findClosestIndex(index + 1, direction);
            } else {
                return index;
            }
        }
        return index;
    }
    
    useInput((input, key) => {
		if (key.escape || (key.ctrl && input === 'c')) {
			exit();
			return;
		}
        if (key.downArrow) {
            if (focusedIndex !== query.length - 1) {
                setFocusedIndex(findClosestIndex(focusedIndex + 1, 'down'));
            }            
        }
        if (key.upArrow) {
            if (focusedIndex !== 0) {
                setFocusedIndex(findClosestIndex(focusedIndex - 1, 'up'));
            }
        }
	});

    useEffect(() => {
        if (executedIndex.length === query.length) {
            setHasFinished(true);
        }
    }, [executedIndex]);

    useEffect(() => {
        if (hasFinished) {
            exit();
        }
    }, [hasFinished]);

    return (
        <>
            <Box flexDirection='row' justifyContent="space-between" marginRight={4} paddingTop={1}>
                <Box flexDirection='column'>
                    <Box paddingX={1} borderStyle='classic'>
                        <Text italic>Commands to execute:</Text>
                    </Box>
                    {/* foreach strings in the query variable create a TextInput component */}
                    {query.map((item, index) => {
                        return (
                            <Box key={'box' + index} paddingX={1} paddingTop={index === 0 ? 1 : 0}>
                                <Text key={'textindex' + index}> {index+1}.  </Text>
                                {executedIndex.includes(index) ? (
                                    <Text key={'text' + index} strikethrough> {item} </Text>
                                ) : (
                                    <TextInput
                                        key={'textinput' + index}
                                        value={item}
                                        focus={focusedIndex === index}
                                        onChange={value => {
                                            const newQuery = [...query];
                                            newQuery[index] = value;
                                            setQuery(newQuery);
                                        }}
                                        onSubmit={value => {
                                            const executeCommand = async (value) => {
                                                let error = '';
                                                try {
                                                    let {stdout} = await execaCommand(value);
                                                    // remove the first and last character from the string if and only if the string starts with quotes (single and double) and ends with quotes
                                                    if ((stdout.startsWith('"') && stdout.endsWith('"')) || (stdout.startsWith("'") && stdout.endsWith("'"))) {
                                                        stdout = stdout.substring(1, stdout.length - 1);
                                                    }
                                                    if (!executedIndex.includes(index)) {
                                                        if(index !== query.length - 1){
                                                            setFocusedIndex(findClosestIndex(index + 1, 'down'));
                                                        } else {
                                                            setFocusedIndex(findClosestIndex(index - 1, 'up'));
                                                        }
                                                        setExecutedIndex([...executedIndex, index]);
                                                    }
                                                    setCmdOutput({
                                                        stdout: stdout,
                                                        error: error,
                                                    });
                                                } catch (error) {
                                                    error = error.toString();
                                                    setCmdOutput({
                                                        stdout: '',
                                                        error: error,
                                                    });
                                                }    
                                            };
                                            executeCommand(value);
                                        }}
                                    />
                                )}
                            </Box>
                        );
                    })}
                </Box>
                <Box flexDirection='column' paddingTop={1}>
                    <Text> | Press <Text color="green">Enter</Text> to execute the command.</Text>
                    <Text> | Move between commands <Text color="green">⬆, ⬇</Text> .</Text>
                    <Text> | Press <Text color="green">Esc/C-c</Text> to exit the program.</Text>
                    { autoCopy ? (
                        <Text> | The commands were copied to your clipboard. ✨</Text>
                    ) : ( null ) }
                </Box>
            </Box>
            <Box borderStyle="classic" paddingX={1} marginTop={1} flexDirection="column">
                    <Box paddingBottom={1}>
                        <Text italic>Output of executed command:</Text>
                    </Box>
                    {cmdOutput ? (
                        cmdOutput.error !== '' ? (
                            <Box paddingLeft={1}>
                                <Text color="red">{cmdOutput.error}</Text>
                            </Box>
                        ) : (
                            <Box paddingLeft={1}>
                                <Text>{cmdOutput.stdout}</Text>
                            </Box>
                        )
                    ) : (
                        null
                    )}
                </Box>
        </>
    );
}                

const Exec = ({apiKey, modelName, prompt, autoCopy, fastExec, directOut}) => {
    const [resultLoaded, setResultLoaded] = useState(false);

    const {exit} = useApp();

    const configuration = new Configuration({
        apiKey: apiKey,
      });
    const openai = new OpenAIApi(configuration);

    // useEffect to initiate the query to the hwt api after the connection status is loaded
    useEffect(() => {
        const initiateQuery = async () => {
            const result = await openai.createCompletion({
                model: modelName,
                prompt: basePrompt.replace('{query}', prompt),
                temperature: 0.1,
                max_tokens: 7,
                });
            setResultLoaded(result);
        };
        initiateQuery();
    }, []);

    // useEffect for fast execution
    useEffect(() => {
        if(resultLoaded.status == 200 && autoCopy){
            // merge all the strings element in the result array into a single string
            const mergedString = resultLoaded.data.choices[0].text;
            // copy the string to the clipboard
            clipboard.writeSync(mergedString);
        }
        if(resultLoaded.status == 200 && directOut){
            const initiateOutput = async () => {
                let result = resultLoaded.data.choices[0].text;
                result = result.split('\n');
                for (let i = 0; i < result.length; i++) {
                    console.log(result[i]);
                }
                exit();
            };
            initiateOutput();
        }
        if (resultLoaded.status == 200 && fastExec) {
            const initiateExecution = async () => {
                let result = resultLoaded.data.choices[0].text;
                result = result.split('\n');
                for (let i = 0; i < result.length; i++) {
                    let {stdout} = await execaCommand(result[i]);
                    // remove the first and last character from the string if and only if the string starts with quotes (single and double) and ends with quotes
                    if ((stdout.startsWith('"') && stdout.endsWith('"')) || (stdout.startsWith("'") && stdout.endsWith("'"))) {
                        stdout = stdout.substring(1, stdout.length - 1);
                    }
                    console.log(stdout);
                }
                exit();
            };
            initiateExecution();
        } else if (resultLoaded.status == 200 && fastExec) {
            console.log('fast execution "-x, --exec" not available for this language');
            exit();     
        } else if (resultLoaded && resultLoaded.status != 200) {
            console.log('Error: ' + resultLoaded.statusText);
            console.log('Check your configuration (hwt -i) and/or update (npm -g update hwt) and try again.');
            exit();
        }
    }, [resultLoaded]);

    /* 
    ** handle the _esc_ape key and the ctrl+c key
    ** available also in the child components
    */
	useInput((input, key) => {
		if (key.escape || (key.ctrl && input === 'c')) {
			exit();
			return;
		}
	});

	return (
		<>
            { 
                resultLoaded ? (
                    resultLoaded.status == 200 ? (
                        fastExec || directOut ? (
                            null
                        ) : (
                            <DisplayExecutionComponent result={resultLoaded.data.choices[0].text} autoCopy={autoCopy} />
                        )
                    ) : (
                        null
                    )
                ) : (
                    <Box>
                        <Box flexGrow={1}>
                            { /* if the connection status is loaded, display the result, otherwise display a loading message */
                                <Text>
                                    <Text color="green">
                                        <Spinner type="dots" />
                                    </Text>
                                    {' Generating commands...'}
                                </Text>
                            }
                        </Box>
                    </Box>
                )
            }
		</>
	);
};

module.exports = Exec;