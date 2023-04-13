const React = require('react');
const { useEffect } = require('react');
const { Box, Text, Newline, useApp } = require('ink');
const Gradient = require('ink-gradient');

const Help = ({missingConfig}) => {
    const {exit} = useApp();

    // close at the end of the first render
    useEffect(() => {
        exit();
    }, []);

	return (
		<>
			<Box flexDirection='column'>
                <Gradient name="mind">
                    <Text>+---------+</Text><Newline/>
                    <Text>|   HWT   |</Text><Newline/>
                    <Text>+---------+</Text><Newline/>
                </Gradient>
                <Text>💡 Generate <Text color="yellow" bold>commands</Text> and <Text color="yellow" bold>code snippets</Text> from your terminal using natural language.</Text>
                <Newline />
                <Box flexDirection='row' justifyContent="space-between">
                    <Text>Usage:</Text>
                    <Box marginRight={4}>
                        <Text> $ <Text bold italic>hwt</Text> [question/request]</Text>
                    </Box>
                </Box>
                <Box flexDirection='row' justifyContent="space-between">
                    <Text>Example:</Text>
                    <Box marginRight={4}>
                        <Text> $ <Text bold italic>hwt</Text> compress the current directory using 'tar'</Text>
                    </Box>
                </Box>
                <Newline/>
                <Box flexDirection='row' justifyContent="space-between">
                    <Text>Options</Text>
                    <Box>
                        <Text italic>~ flags should be at the start of the command ~</Text>
                    </Box>
                </Box>
                
                <Box flexDirection='row' justifyContent="space-between">
                    <Text>  --help, -h  </Text>
                    <Box marginRight={4}>
                        <Text>Show <Text color="yellow" bold>help</Text> (this page)</Text>
                    </Box>
                </Box>
                <Box flexDirection='row' justifyContent="space-between">
                    <Text>  --version, -v</Text>
                    <Box marginRight={4}>
                        <Text>Show the current <Text color="yellow" bold>version</Text></Text>
                    </Box>
                </Box>
                <Box flexDirection='row' justifyContent="space-between">
                    <Text>  --init, -i</Text>
                    <Box marginRight={4}>
                        <Text><Text color="yellow" bold>Init</Text>ialise hwt configuration, needed before use</Text>
                    </Box>
                </Box>
                <Box flexDirection='row' justifyContent="space-between">
                    <Text>  --exec, -x</Text>
                    <Box marginRight={4}>
                        <Text><Text color="yellow" bold>Exec</Text>ute the commands immediately 💀 at your own risk</Text>
                    </Box>
                </Box>
                <Box flexDirection='row' justifyContent="space-between">
                    <Text>  --out, -o</Text>
                    <Box marginRight={4} flexDirection='column' alignItems='flex-end'>
                        <Text>Get the generated commands directly to the std<Text color="yellow" bold>out</Text></Text>
                    </Box>
                </Box>
            </Box>
            { 
                    missingConfig ? 
                    <>
                    <Box flexDirection='row' justifyContent="space-between" paddingY={1}>
                        <Text color="red"><Text bold>‼</Text> You still need to setup hwt</Text>
                        <Box>
                            <Text color="red"> $ <Text bold italic>hwt</Text> --init</Text>
                        </Box>
                    </Box>
                    </> : <Newline/>
                }
		</>
	);
};

module.exports = Help;
