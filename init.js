const React = require('react');
const {Box, Text, useInput, useApp} = require('ink');
const { useEffect } = require('react');
const TextInput = require('ink-text-input').default;

const Init = ({config}) => {
	const [temp, setTemp] = React.useState('');
	const [questionIndex, setQuestionIndex] = React.useState(0);

	let { exit } = useApp();

	config.set('modelName', 'text-davinci-003');

	let questions = [
		{
			question: 'Enter your API key from OpenAI. Press "Enter" to continue in case you already have.',
			key: 'apiKey',
		},
		{
			question: 'Do you want to automatically copy the output of the app to your clipboard? (y/n)',
			key: 'autoCopy',
		}
	];

	useInput((input, key) => {
		if (key.escape || (key.ctrl && input === 'c')) {
			exit();
			return;
		}
	});

	useEffect(() => {
		if (questionIndex !== 0 && questions[questionIndex-1].key === 'autoCopy') {
			if (temp === 'y' || temp === 'Y' || temp === 'yes' || temp === 'Yes') {
				config.set('autoCopy', true);
			} else {
				config.set('autoCopy', false);
			}
		}

		if (questionIndex !== 0 && questions[questionIndex-1].key === 'apiKey') {
			if (temp !== '') {
				config.set('apiKey', temp);
			}
			setTemp('y');
		}

		if (questionIndex === questions.length) {
			console.log('Configuration saved successfully! ✅');
			exit();
		}
	}, [questionIndex]);

	return (
		<>
			<Box>
	            {questions.map((question, index) => {
					if (index === questionIndex) {
						return (
							<Box key={index}>
								<Text>{question.question}: </Text>
								<TextInput
									value={temp}
									onChange={(value) => {
										setTemp(value);
									}}
									onSubmit={() => {
										setQuestionIndex(questionIndex + 1);
									}}
								/>
							</Box>
						);
					}
				})}
            </Box>
		</>
	);
};

module.exports = Init;
