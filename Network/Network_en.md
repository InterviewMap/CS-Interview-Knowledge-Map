# UDP

## Message-oriented

UDP is a message-oriented protocol, and message means chunks of data that delivered on the internet. UDP does just deliver the message without any handle like split or combine.     

More specifically   

- At the sender end，When a UDP message is sent, the UDP protocol will get the data from the application layer, and it will only add the UDP header to the data, nothing besides. And then deliver it to the network layer.
- At the receiving end，When got a UDP message from the network layer, the UDP protocol will only remove the IP header added on the data without any other operations.

## Unreliable

1. UDP is connectionless, communication without establishing or disconnect
2. UDP is unreliable, it will deliver what it has got, no cache and does not care about the delivery.
3. UDP has no congestion control, data is sent at a constant speed. Even if the network is terrible, it will not adjust the speed. So it is inevitable to lose some packet, while it has the advantage of real-time applications, such as we will use UDP instead of TCP in the telephone conference.

## Efficient

There is no guarantee of delivery, ensure that data is not lost and arrives in orderly in UDP. It is not as complicated as TCP.  It does not cost a lot in its header data with only 8 bytes much less than TCP which head data need at least 20 bytes. So it can transport the data efficiently.

![](https://user-gold-cdn.xitu.io/2018/5/1/163195b245ceb89c?w=831&h=170&f=png&s=22793)

The UDP header consists of 4 fields: 

- two port number of 16 bits, source port (optional) and destination port
- the length of the data
- checksum (IPv4 optional) which is used for error-checking of the header and the data.

## Transmission mode

The transmission modes of UDP not only contains one-to-one, but also contains one-to-many, many-to-many, and many-to-one, which means UDP supports unicast, multicast and broadcast.

# TCP

## Header

The header of TCP is much more complicated than UDP's.

![](https://user-gold-cdn.xitu.io/2018/5/1/1631be45b084e4bc?w=858&h=305&f=png&s=62112)

When talking about the header of TCP, these fields are significant.

- Sequence Number: This number can guarantee that all the segments are ordered, and the opposite host can order the segments by it.
- Acknowledgment Number: This number is saying the next segment number that the opposite host expected, and everything before this has been received.
- Window Size: How many segments can the opposite host accept, it used to control the flow.
- Identifier
  - URG=1: When this flag is set, that means this segment is urgent and should be prioritised. 
  - ACK=1: Besides according to the TCP protocol, after connection, all the segments that transported should set the ACK=1. 
  - PSH=1:  When this flag is set, it means that the receiver should push the data to the application layer instead of store it in the caches until the cache is full.
  - RST=1: When this flag is set, it means that the TCP connection has a serious problem. It may need to reconnect. It also can be used to refuse invalid segments or requests.
  - SYN=1: When SYN is 1 and ACK is 0, it means that this is a connect request segment, while SYC is 1 and ACK is 1, it is a response that agrees to connect.
  - FIN=1: When this flag is set, it means that this is a request segment that asks for closing the connection.

## State machine

  HTTP is stateless, so TCP which is based on HTTP is also stateless. It seems like that TCP links the two ends, client, and server, but it is actually that both the two ends maintain the state together.
![](https://user-gold-cdn.xitu.io/2018/5/1/1631bef9e3c60035?w=1280&h=965&f=png&s=101432)

The state machine of TCP is very complicated, and it is closely related to the handshake of opening and closing a connection. Now we'll talk something about the two kinds of a handshake.
Before this, you'd better know something about RTT(Round-Trip-Time), an important index of performance. It is the length of time it takes for a signal to be sent plus the length of time it takes for an acknowledgement of that signal to be received. 

### Three-way handshake in opening a connection

![](https://user-gold-cdn.xitu.io/2018/5/1/1631bf1e79b3cd42?w=666&h=426&f=png&s=32121)

In TCP, the end which is active opened is called the client and the passive opened is called server. No matter client or server can send and receive data after connection, so TCP is a bi-directional communication protocol.
At first, both ends are closed. Before communication, both of the ends will create the TCB(TCP Control Block). After that, the server will be in the `LISTEN` state and begin to wait for the data from the client.

**First handshake**

The client sends the connect request data which contains an SYN. After that, the client is in the status called `SYN-SENT`. 

**Second handshake**

After getting the request, the server will send a response if it agrees to establish a connect and then turn to `SYN_RECEIVED`. There is also an SYN in the response. 

**Third handshake**

When the client receives the agreement of establishing a connection, it needs to send an acknowledgement. After that the client turns to `ESTABLISHED`, and the server turns to the same state after receiving the acknowledgement. The connection is established successfully by now.

PS: In the process of the third handshake, it is possible to carry data in it by using TFO. All protocols about handshake can use methods of TFO-like to reduce RTT by storing the same cookie.

**Why need the third handshake if the connection can be established after the twice**

This will prevent the scenario that an invalid request reached the server and wasted the resource of the server.

Imagine that, the client sends a connect request called A, but the network is bad and client retransmits another called B. When B reach the server, and the server handles it correctly, the connection will be established successfully. If A reached when connect B was closed, the server might think that this is a new request. So the server handles it and enters `ESTABLISHED` state while the client is closed. This will waste the resource of the server.

PS: Through connecting, if any end is offline, it needs to retransmit, generally, five times. You can limit the times of retransmitting or refuse the request if can't handle it.

### Four-handshake of disconnect.

![](https://user-gold-cdn.xitu.io/2018/5/2/1631fb807f2c6c1b?w=640&h=512&f=png&s=31059)

TCP is a bi-directional communication protocol, so both ends need to send FIN and ACK when closing a connection.

**First handshake**

Client A asks the server B to close a connection if it thinks there is no data to send.

**Second handshake**

After receiving the request, B will ask the application layer to release the connection and send an ACK, then enter `CLOSE_WAIT` state. That means that the connection from A to B has been terminated and B will not handle the data from A. But B still can send data to A because of the bi-direction.

**Third handshake**

B will continue to sending data if needed, after that it will ask the client A to release the connection and enter `LAST-ACK` state.

PS: The second and the third handshake can be combined by delay-ACK. But the delay time should be limited. Otherwise, it will be treated as a retransmission.

**Forth handshake**

A will send the ACK response and enter `TIME-WAIT` state after receiving the request.
The state will last for 2MLS. MLS means the biggest lifetime that segment can survive and it will be abandon if beyond that. A will enter `CLOSED` state if there is no retransmission from B among 2MLS. B will enter `CLOSED` state after receiving the ACK.

**why A should enter `TIME-WAIT` state for 2MSL before it enters `CLOSED` state**

This can ensure that B is enabled to get the ACK from the A. If A enter `CLOSED` state immediately, B may be not able to close correctly for not receiving the ACK with the wrong network.

## ARQ protocol

ARQ,  also known as automatic repeat request, is an error-control method for data transmission that uses acknowledgement and timeouts. It contains Stop-and-Wait ARQ and Continuous ARQ.

### Stop-and-Wait ARQ

**Normal transport**

There has to launch a timer and wait for a response as long as A sends a message to B, then cancel it and send a message after receiving the response. 

**Packet lost or error**

It is possible to lost packet in transmitting. So it needs to retransmit the message if the timer is time-out until receiving the response. That is why we need a data copy.

It may also have problems in transmitting even the server receiving the message correctly. And the message will be abandoned, and the receiver waits for another transmission.

PS: Generally, the limit set by the timer is longer than the average of the RTT.

**ACK time-out or lost**

The response of B may also have the problem of packet loss or time-out. In this case, the client needs to retransmit. When the server got the same SYN flag, it will abandon the message and send the previous response until receiving the next SYN.

The response may arrive after the limit time, and client A will check whether get the same ACK, if true, abandon it. 

The client has to wait for the ACK even in a good network, so the effectiveness of transmission is terrible, that is the shortcomings of this protocol.

### Continuous ARQ

The sender has a sending window in which all the data will be sent without the ACK in Continuous ARQ. This can improve the effectiveness by reducing the waiting time comparing with the Stop-and-Wait ARQ.

### Cumulative Acknowledgement

The receiver will receive a message with nonstop in Continuous ARQ. If it sends the response immediately every time like the Stop-and-Wait ARQ, it may waste the resource too much. So the client B can send an ACK after receiving a sort of message, that is what we called Cumulative Acknowledgement. The ACK indicates that all the data before this flag had been received and the client A should send the next message.

But it is not so perfect. Imagine that client A send a sort of message from segment 5 to segment 10 in Continuous ARQ, and the client B receives all the segments successfully except segment 6. In this case, the client B has to send the ACK of 6 even though the segments after 6 had been received successfully which caused the waste of resource. In fact, this problem can be solved by Stack which will be introduced following.

## Sliding window

We have mentioned the sliding window above. Both ends maintain the windows, send window & receive window, in TCP.

The sender window contains data that has been sent but not received, and data that can be sent but not sent.

![](https://user-gold-cdn.xitu.io/2018/5/5/1632f25c587ffd54?w=660&h=270&f=png&s=37109)

The size of the send window is determined by the rest size of the receive window. The response will carry the rest size of the current receive window, and when the sender receives the response, it will set the size of the send window by the value and the network congestion. So the size of the send window is changeable.

When the sender receiving the response, it will slide the window.

![](https://user-gold-cdn.xitu.io/2018/5/5/1632f25cca99c8f4?w=660&h=210&f=png&s=24554)

Sliding window implementation the flow-control. The receiver notifies the sender of the size of the data which can be handled so that it can handle the data successfully by this.

### Zero window

There may encounter a zero window on the opposite end through the transmission. In this case, the sender will stop sending data and launch the persistent timer which can send a request to the receiver to ask for the window size. After trying sometimes, it may terminate the TCP connection. 

## Congestion Control

Congestion control is different from the flow control. The later is used in the receiver to ensure that it can handle the data in time. The former is used in the network to avoid that too much data congested the network and the network is overload.

There are four algorithms in Congestion control: Slow-start, Congestion Avoidance, Fast Retransmit and Fast Recovery.

### Slow-start algorithms

As the name suggests, is to exponentially expand the send window at the beginning of the transfer, thereby avoiding network congestion caused by the transmission of large amounts of data from the start.

Steps of Slow-start are as follows:

1. set the congestion windows size of 1 MSS at the beginning of the connection.
2. double the value of the size after each RTT
3. when the value of the size reaches the threshold, the Congestion Avoidance algorithms begins.

### Congestion Avoidance algorithms

It is more simple than Slow-start. One each RTT will only increase the value of the congestion window by one. By this way, it can avoid causing network congestion by double the value and slowly adjusts the size to the optimal value.

TCP will treat it as network congestion when the timer is a time-out in transmitting. It will do the follows immediately:

1. reduce the current threshold of the congestion window to half
2. set the value of the congestion window to 1 MSS
3. start the Congestion Avoidance algorithms

### Fast Retransmit

Fast Retransmit always appears with the Fast Recovery. Once the data got by the receiver is disordered, the receiver will only send a response with the last correct SYN (without the Sack). If the sender got three repeated ACK, it would start the fast retransmit immediately instead of waiting for the timer time-out.

**The realization of TCP Taho**

- reduce the current threshold of the congestion window to half
- set the value of the congestion window to 1 MSS
- re-start the Slow-start 

**The reaction of TCP Reno**

- reduce the congestion window to half
- set the threshold same the size of the current congestion window
- enter the stage of the Fast Recovery (retransmit the packet, leave this stage once got a new ACK)
- use Congestion Avoidance algorithms

### Fast Recovery (TCP New Reno)

TCP New Reno improved the defect of the previous TCP Reno. Before this, it will drop out once got a new ACK.

TCP sender will store the biggest queue number of three repeated ACK in TCP New Reno.

If a segment carries the message from 1 to 10 of the number but the data of 3 and 7 is lost. Then the biggest number in this segment is 10. The sender will only get the ACK of 3. Then the data of 3 will be retransmitted. And the receiver received it and sent the ACK of 7. At this time, TCP knows that the receiver lost more than on packets and will continue to send the data of 7. The receiver received it and sent the ACK of 11. By now, the sender infers that the segment had been received successfully and will drop out the stage of the Fast Recovery. 

# HTTP

HTTP protocol is stateless, it does not store the status.

## Difference between POST & GET

At first， we'll introduce something about idempotence and side-effects.

Side-effects mean that operations can change the status of the resource on the server, searching for some resource is none-side-effects but registering does.

Idempotence means that the side-effects of N > 0 identical requests is the same as for M > 0 identical requests. Register 10 accounts are the same as 11 accounts, while change an article 10 times is different like 11 times.

Generally, Get is usually used in idempotence and none-side-effects scenes while Post is used in side-effects and not idempotence scenes.

Technically:

- Get could cache the response but Post not
- Post is safer than Get, because the params of Get is combined in URL while it is in the request body in Post and the browser will cache the resource by Get. But the Post data also can be captured with tools.
- Post can transport more data by `request body`, GET can't.
- Since the URL length is restricted, so the data transported by Get is restricted, and the limit varies by browser. But with Post, the data is in the request body, there is no limit on length.
- Post support more encoding types and without limitation of the data type.

## Common Status Code

**2XX success**

- 200 OK: the request from the client had been handled correctly in the server.
- 204 No content:  The server successfully processed the request and is not returning any content.
- 205 Reset Content: The server successfully processed the request, but is not returning any content. Unlike a 204 response, this response requires that the requester reset the document view.
- 206 Partial Content: The server is delivering only part of the resource (byte serving) due to a range header sent by the client.    

**3XX Redirection**

- 301 Moved Permanently: The resource had been moved to a new URI permanently. This and all future requests should be directed to the given URI.
- 302 Found: The resource had been moved to a new URI temporary. This request should redirect to the given new URI.
- 303 See other: The response to the request can be found under another URI in the response using the GET method.
- 304 Not Modified: It indicates that the resource has not been modified since the version specified by the request headers If-Modified-Since or If-None-Match. In such case, there is no need to retransmit the resource since the client has a previously download copy.
- 307 Temporary Redirect: In this case, the request will re-redirected to a new URL for temporary, and future requests should still use the origin URI.

**4XX Client Errors**

- 400 Bad Request: The server will not or can not process the request due to an apparent client error.
- 401 Unauthorized: When the authentication of the request is required and has failed or has not yet been provided.
- 403 Forbidden: The request is valid, but the server is refusing action. The user might not have the necessary permission for a resource or may need an account of some sort.
- 404 Not Found: The requested resource could not be found in the server but may be available in the future.

**5XX Server Errors**

- 500 Internal Server Error: The server encountered an error when processing a request.
- 501 Not Implemented: The server cannot fulfil the request.
- 503 Service Unavailable: The server is currently unavailable because it is overloaded or down for maintenance.

|   Common Fields   |                         Description                          |
| :---------------: | :----------------------------------------------------------: |
|   Cache-Control   |                 It tells caching mechanisms                  |
|    Connection     | type of connection that the browser prefers, e.g.  `keep-alive` |
|       Date        |         the date and time that the message was sent          |
|      Pragma       | message directives that may have various effects anywhere along the request-response chain |
|        Via        | Informs the client of proxies through which the response was sent. |
| Transfer-Encoding | the form of encoding used to safely transfer the entity to the user. |
|      Upgrade      |     ask the opposite domain to upgrade another protocol      |
|      Warning      |    a general warning about problems with the entity body.    |

|   Request Fields    |                         Description                          |
| :-----------------: | :----------------------------------------------------------: |
|       Accept        |       Media types that are acceptable for the response       |
|   Accept-Charset    |              character sets that are acceptable              |
|   Accept-Encoding   |               list of the acceptable encodings               |
|   Accept-Language   |               list of the acceptable languages               |
|       Expect        | Indicates that particular server behaviours are required by the client |
|        From         |       the email address of the user making the request       |
|        Host         | The domain name of the server and the TCP port number on which the server is listening. |
|      If-Match       | if the client supplied entity matches the same entity on the server,r the request will be performed. |
|  If-Modified-Since  | Allows a 304 Not Modified to return if the content is unchange（compare with the Date） |
|    If-None-Match    | Allows a 304 Not Modified to return if the content is unchange（compare with the ETag） |
|     User-Agent      |          the `user agent string` of the user agent           |
|    Max-Forwards     | limit the number of times the message can be forwarded through the proxies and the gateways |
| Proxy-Authorization |       authorization credentials for connecting a proxy       |
|        Range        |  request only part of an entity. Bytes are numbered from 0.  |
|       Referer       | This is the address of the previous web page from which a link to the currently requested page was followed |
|         TE          | The transfer encoding the user agent, is willing to accept. The same values as for the response header field Transfer-Encoding can be used. |

|  Response Fields   |                         Description                          |
| :----------------: | :----------------------------------------------------------: |
|   Accept-Ranges    | What particle content range types this server supports via `type serving` |
|        Age         |   The age the object has been in a proxy cache in seconds    |
|        ETag        | An identifier for a specific version of a resource, often a message digest |
|      Location      |                 use to redirect to a new URL                 |
| Proxy-Authenticate |          request authorization to access the proxy           |
|       Server       |                      name of the server                      |
|  WWW-Authenticate  | Indicates the authorization scheme that should be used to access the requested entity. |

|  Entity Fields   |                         Description                          |
| :--------------: | :----------------------------------------------------------: |
|      Allow       |            valid methods for a specified resource            |
| Content-Encoding |          the type of the encoding used on the data           |
| Content-Language |               the language used on the content               |
|  Content-Length  |               the length of the response body                |
| Content-Location |         an alternate location for the returned data          |
|   Content-MD5    | a Base64-encoded binary MD5 sum of the content of the response |
|  Content-Range   |   wherein a full body massage this partial message belongs   |
|   Content-Type   |                 the MIME type of the content                 |
|     Expires      |    the date after which the response is considered stale     |
|  Last_modified   |        the last modified date of the requested object        |

PS: Something about cache has completed in another chapter. You can [read this one](../Performance/performance-ch.md#cache).

# HTTPS

HTTPS transfer the data by HTTP and the data is encrypted by the TLS protocol.

## TLS

TLS protocol is above the transmission layer and below the application layer. The first time to use TLS to transfer data need RTT twice, and then we can reduce it to once by using Session Resumption.

There are two techniques for encrypting information: symmetric encryption and asymmetric encryption.

**symmetric encryption**

A secret key, which can be a number, a word, or just a string of random letters, and both sender and recipient know it, is applied to encrypt and decrypt all the messages.

**asymmetric encryption**

There are two related keys -- a key pair in the asymmetric encryption. A public key is made freely available to anyone. A second, private key is kept the secret so that only you know it. The private key can only decrypt the message encrypted by the public key. 

**TLS handshake**

![](https://user-gold-cdn.xitu.io/2018/5/12/1635260126b3a10c?w=1558&h=1006&f=webp&s=59424)

1. The client sends a random value, along with the required protocol and encryption method.
2. The server receives the random value of the client, and also generates a random value by itself, and sends the certificate according to the requirement. 
3. The client verifies the server's digital certificate and then create another random value encrypted with the server's public key. If the server required a certificate from the client, the client sends it.
4. The server got the second random value from the client and decrypted it with its private key. And both the server and the client have the three random value. So they can generate the session key and exchange data that are encrypted with the session key later.

From the above, in the handshake, the client and server communicate with symmetric encryption. But considering the performance, they use the asymmetric encryption to communicate with each other after connected.

PS: The above description is the handshake of the TLS 1.2 protocol. In the 1.3 protocol, only one RTT is needed to establish a connection for the first time, and the RTT is not required to restore the connection later.

# HTTP/2

Compare with HTTP/1. X, there is a substantial increase in the web's performance in the HTTP/2.

We usually use CSS Sprite, base64, multiple-domain-names and so on to improve the performance. It is all because of that browser limit the number of HTTP connections with the same domain. If there are too many resources to download, all these resources need to queue. And if hit the limit, those behind it will need to wait until previous had been loaded. That is called head-of-line blocking. 

You can see how much faster of HTTP/2 than HTTP/1.x by [this link](https://http2.akamai.com/demo).

![](https://user-gold-cdn.xitu.io/2018/5/12/163542ca61eaff17?w=929&h=512&f=png&s=245670)

You will find the request queue is something like this in HTTP 1.x because of head-of-line blocking.

![](https://user-gold-cdn.xitu.io/2018/5/12/163542c96df8563d?w=518&h=642&f=png&s=72417)

But with the MultiPlexing in HTTP/2, you'll find this:

![](https://user-gold-cdn.xitu.io/2018/5/12/163542c9d3128c7a?w=900&h=616&f=png&s=71014)

## Binary Transport

This is the point of all the improvement of performance in HTTP/2. We transfer data by plain text in the previous versions of HTTP. But in HTTP/2, all of the data transferred will be split and transported by binary with the new encoding.

![](https://user-gold-cdn.xitu.io/2018/5/12/163543c25e5e9f23?w=874&h=459&f=png&s=26320)

## MultiPlexing

There are two important concepts in HTTP/2: frame and stream.

- Stream: A bi-directional flow of bytes within an established connection, which may carry one or more message.
- Frame: The smallest unit of communication in HTTP/2, each containing a frame header, which at a minimum identifies the stream to which the frame belongs.

There is one or more stream in a single connection, so we can send more than one request, and the opposite end can identifier which the request belongs to by the identifiers in the frame. By this, we can avoid the head-in-line blocking and improve the performance highly.

![](https://user-gold-cdn.xitu.io/2018/5/12/1635442531d3e5ee?w=494&h=138&f=png&s=9636)

## Header compression

In HTTP/1. X, we transfer data of the header by plain text. In the case where the header carries a cookie, it may be necessary to transfer hundreds to thousands of bytes each time repeatedly.

In HTTP 2.0, the header of the transport was encoded using the HPACK compression format, reducing the size of the header. The index table is maintained at both ends to record the occurrence of the header. The key name of the already recorded header can be transmitted during the transmission. After receives the data, the corresponding value can be found by the key.

## server push

In HTTP/2, the server can push resources to the client without the client having to request. Imagine that, something in the server is necessary for the client, so the server can push the associated resources ahead of time to reduce the delay time. By the way, we can also use `pre-fetch` if the client is compatible.

## QUIC

QUIC (Quick UDP Internet Connections) that designed by Google is a transport layer network protocol based on UDP. QUIC's main goal is to improve the performance of connection-oriented web applications that are currently using TCP. 

- HTTP/2 based on TCP. But because of the retransmission mechanism of TCP, head-of-line blocking will occur even one packet failed.  QUIC based on UDP and supports the multiplexing and without this problem.
- Implemented its encryption protocol, can achieve 0-RTT through TCP-like TFO mechanism, of course, TLS 1.3 has achieved 0-RTT.
- retransmission support and forward error correction, if you only lose one packet, and you don't have to retransmit, you can use forward error correction to resume the lost packet.
  - QUIC can use forward error correction to reconstruct lost packets. A scheme similar to RAID systems using XOR operations.
  - But it cannot reconstruct lost packets when multiple packets are lost within a group.

# DNS

The Domain Name System (DNS) match the IP address by given hostname.

The IP address which is composed of a number and letter is difficult for the human to remember, so the hostname is created. You can treat the hostname as the alias of the IP address. The DNS is used to convert a hostname to its real name.

The process of DNS begins before TCP handshake, it is processed by the system. When you type `www.google.com` in the browser:

1. the OS query from the local cache first
2. query to the configured DNS servers by OS if there is no result in step1.
3. query to the DNS root server, which can offer a server who can resolve all the top level domains such as `.com`
4. then query to the server specified by step3 and look up the second-level domain name `google`
5. the third level domain name like `www` is configured by yourself.  You can set `www` to an IP address, and do the same thing to another the third level domain.

All above is DNS Iterative Query, there has another way to query DNS: Recursive Query. The difference between them is that the former do the query by the client while the latter does by the configured DNS servers and then transport the data got to the client.

PS： DNS query is based on UDP.

# What happens when you navigate to an URL

This is a classical problem in an interview. We can concatenate the topics all above in this theme.

1. Do the DNS query first, it will offer the most suitable IP address with the intelligent DNS parsing
2. and then is the TCP handshake, the application layer will deliver the data to transport layer where the TCP protocols will point out the ports of both ends, and then transport the data to the network layer. The IP protocols in network layer will determine the IP address and how to navigate to the router, and then the packet will be packaged to the data frames. And at last is the physical transport.
3. After the TCP handshake is the TLS handshake, and then is the formal data transport. 
4. It is possible for the data to go through the load balancing servers before its accesses to the server. The load balancing server will deliver the requests to the source servers and response with an HTML file.
5. When got the response, the browser will check the status code, it will continue parsing the file with the status code 200. And if get 400 or 500, it will throw an error. If there is 300 code, it will redirect to a new URL. And there is also a redirection counter to avoiding too much redirection by throw an error.
6. The browser will parse the file,  decompression if the file type is with compressions like gzip and then parse the file by the encoding type. 
7. After the successful parsing, the render flow will start formally. It will construct the DOM tree by HTML and construct the CSSOM with CSS. If there is a `script` tag, it will check it whether has the `async` or `defer` attributes, the former will download and execute the JS file parallelly, and the later will load the file first and wait to execute until the HTML has been parsed. If none of them, it will block the render engine until the JS file has been executed. Download with the HTTP/2 it may highly improve the effectiveness of pictures download.
8. The `DOMContentLoaded` event will be triggered after the initial HTML has been loaded and parsed completely.
9. The Render tree will be constructed after the CSSOM and the DOM tree, in which the layout the page elements, styles and something else will be calculated.
10. In the process of constructing the Render tree, the browser will call the GPU to paint, combine the layers and display the contents on the screen.