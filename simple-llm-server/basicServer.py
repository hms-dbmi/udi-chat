from http.server import BaseHTTPRequestHandler, HTTPServer
import urllib
import ollama

'''
Testing simple server, the client code currently isn't actually connecting to this though.
'''


class SimpleHTTPRequestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        print('GET request received')
        parsed_path = urllib.parse.urlparse(self.path)
        query = urllib.parse.parse_qs(parsed_path.query)
        query = query.get('q', [''])[0]
        response = query
        if query:
            print('prompt:', query)
            response = ollama.chat(model='llama3', messages=[{'role': 'user', 'content': query}])
            response = response['message']['content']
            print(response)
        
        self.send_response(200)
        self.send_header('Content-type', 'text/plain')
        self.end_headers()
        self.wfile.write(response.encode())

def run(server_class=HTTPServer, handler_class=SimpleHTTPRequestHandler, port=8888):
    server_address = ('localhost', port)
    httpd = server_class(server_address, handler_class)
    print(f'Starting server on port {port}...')
    httpd.serve_forever()

if __name__ == '__main__':
    run()