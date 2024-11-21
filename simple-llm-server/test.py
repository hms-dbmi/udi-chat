import ollama


print('prompt: Why is the sky blue? (wait for full response)')

response = ollama.chat(model='llama3', messages=[
    {'role': 'user', 'content': 'Why is the sky blue?'},
])

print(response)
print('\n\n\n')

print('prompt: Why is the sky blue? (stream response)')
print()

response = ollama.chat(
    model='llama3',
    messages=[{'role': 'user', 'content': 'Why is the sky blue?'}],
    stream=True
)

for chunk in response:
    print(chunk['message']['content'], end='', flush=True)