+ UDP
  - Message-oriented
  - Unreliable
  - Efficient (faster that TCP)
  - Transmission mode
+ TCP
  - header
  - State Machine
    - three-way handshake
    - four-way handsheke
  - ARQ protocol
    - Stop-and-Wait ARQ
    - Continuous ARQ
    - Cumulative Acknowledgement
  - Sliding Window
    - Zero window
  - Congestion Control
    - Slow-start
    - Congestion Avoidance
    - Fast Retransmit
    - Fast Recovery
+ HTTP
  - Difference between POST & GET 
  - Common Status Code
  - HTTP Header
+ HTTPS
  - TLS
+ HTTP/2
  - Binary Transport
  - MultiPlexing
  - Header Compression
  - Server Push
  - QUIC
+ DNS
+ What happens when you navigate to a URL

# UDP
User Datagram Protocol
## Message-oriented      

UDP is a message-oriented protocol, and message means chunks of data that delivered in the internet. What UDP does just deliver the message without any handle like split or combine.     

More specifically   
+ When a UDP message is sent, the UDP protocol will get the data from application layer at transport layer, and it will  only add the UDP header to the data, nothing besides. And then deliver it to the network layer.
+  When got a UDP message from the network layer, the UDP protocal will only remove the IP header added on the data without any other operations.

## Unreliable
1. UDP is connectionless, without opening or finishing a socket
2. UDP is unreliable, it will deliver what it has got, no stores and does not care about the delivery.
3. UDP has no congestion control, data is sent at a constant speed. Even if the network is bad, it will not adjust the speed. So it is inevitable to lose some packet, while it has advantage in real time applications, such as we will use UDP instead of TCP in telephone conference.

## Efficient
There is no guarantee of delivery, ordering or duplicate protection in UDP.It is not as complex sa TCP.  It does not costs a lot in its header data with only 8 bytes much less than TCP which head data need at least 20 bytes. So it can transport the data efficiently.

![](https://user-gold-cdn.xitu.io/2018/5/1/163195b245ceb89c?w=831&h=170&f=png&s=22793)

The UDP header consists of 4 fields: 

+ two port number of 16 bits, Source port (optional) & Desitination port
+ the length of the message data
+ checksum of the message data which is used for error-checking of the header and the data.

## Transmission mode
The transmission modes of UDP not only contains one-to-one, but alse contains one-to-many, many-to-many, and many-to-one, which means UDP supports Unicast, multicast and broadcast.

# TCP
Transmission Control Protocol

The header of TCP is much more complex than UDP's.

![](https://user-gold-cdn.xitu.io/2018/5/1/1631be45b084e4bc?w=858&h=305&f=png&s=62112)

When talk about the header of TCP, these keys are vary important.

+ Sequence Number: This number can guarantee that all the segments are ordered and the opposite host can order the segments by it.
+ Acknowledgement Number: This number is saying the next segment number that the opposite host expected, and everything before this has been accepted successfully at the same time.
+ Window Size: How many segments else can the opposite host accept, it used to control the stream flow.
+ Identifier
  - URG=1: When this flag is set, that means this segment is urgent and should be prioritized. And the urgent pointer is in the TCP header, it indicates  how much of the data in the segemnt , counting from the first bytes , is urgent.
  - ACK=1: When this flag is set, it means that the acknowledgement is valid. Besides according to the TCP protocol, after connection all the segments that transported should set the ACK. 
  - PSH=1:  When this flag is set, it means that the reveiver shoul push the data to application layer instead of store it in the caches untils the cache is full.
  - RST=1: When this flag is set, it means that the TCP connection has serious problem. It may be need reconnect. It also can be used to refuse invalide segments or requests.
  - SYN=1: When SYN is 1 and ACK is 0, it means that this is a request segment, while SYC is 1 and ACK is 1, it is a response that agree to connect.
  - FIN=1: When this flag is set, it means that this is a request segment that ask for closing the connect.

  ## state machine
  HTTP is stateless, so TCP which is based on HTTP is alse stateless. It seems like that TCP links the two ends, client and server, but it is actually that both the two ends maintain the state together.
![](https://user-gold-cdn.xitu.io/2018/5/1/1631bef9e3c60035?w=1280&h=965&f=png&s=101432)

The state machine of TCP is very complex, and it is closely related to the handshake of opeing and closing a connection. Now we'll talk something about the two kind of hadshake.
Before this, you'd better know something about RTT(Round-Trip-Time), an important index of performance. It is the length of time it takes for a singal to be sent plus the length of time it takes for an acknowledgement of that signal to be received. 

### three-way handshake in opening a connection
![](https://user-gold-cdn.xitu.io/2018/5/1/1631bf1e79b3cd42?w=666&h=426&f=png&s=32121)

In TCP, the end which is active opened is called client and the passive opened is called server. No matter client or server can send and receive data after connection, so TCP is a bi-directional communication protocol.
At first, both ends are closed. Before communication, both of the ends will create the TCB(TCP Control Block). After that, the server will be in `LISTEN` state and begin to waiting for the data from client.

**first handshake**

The client send the request data which contains  a SYN. After that, the client is in the status called `SYN-SENT`. 
**second handshake**

After got the request, the server will send a response if it agree to establish a connect and then turn to `SYN_RECEIVED`. There is also a SYN in the response. 
**third handshake**
When the client receive the agreement of establishing a connection, it need to send a acknowledgement. After that the client turn to `ESTABLISHED`  and the server turn to the same state after receive the acknowledgement. The connection is established successfully by now.

PS: In the process of the third handshake, it is possiable to carry data in it by using TFO. ALL protocols in relation to handshake can use methods of TFO-like to reduce RTT by storing the same cookie.

**why need the third handshake even though the connection can be established after the twice**

This will prevent the scenario that a invalid request reached the server and waste the resource of server.

Image that, client send a request called A, but the network is poor and client send another called B. When B reach server and the server handle it correctlly, the connectin will be established successfully. If A reached after the connection established by B was closed, the server might think that this is a new request. So the server handle it and enter `ESTABLISHED` state while the client is closed. This will waste the resource of server for waiting nothing.

PS: Through connecting, if any end is offline, it need to retransmit ,generally, 5 times. You can limit the times of retransmiting or refuse the request if can't handle it.

### four-handshake of connection termination. 

![](https://user-gold-cdn.xitu.io/2018/5/2/1631fb807f2c6c1b?w=640&h=512&f=png&s=31059)

TCP is a bi-directional communication protocol, so both end need to send FIN and ACK when closing a connection.

**first handshake**

Client A ask the server B to close a connection actively if it thinks there is no data to send.

**second handshake**

After receiving the request, B will ask the application layer to release the connection and send a ACK, then enter `CLOSE_WAIT` state. That means that the connection from A to B has been terminated and B will not handle the data from A. But B still can send data to A because of the bi-direction.

**third handshake**

B will continute to sending data if needed, after that it will ask the client A to release the connection and enter `LAST-ACK` state.

PS: The second and the third handshake can be combined by delay-ACK. But the delay time should be limited, otherwise it will be treated as a retransmission.

**forth handshake**

A will send the ACK response and enter `TIME-WAIT` state after receiving the request.
The state will last for 2MLS. MLS means the biggest lifetime that segment can survive and it will be abandon if beyond that. A will enter `CLOSED` state if there is no retransmission from B among 2MLS. B will enter `CLOSED` state too after receiving the ACK.

**why A should enter `TIME-WAIT` state for 2MSL before it enter `CLOSED` state**
This can ensure that B is enable to get the ACK from the A. If A enter `CLOSED` state immediately, B may be not able to closed correctly for not receiving the ACK with bad network.

## ARQ protocol

ARQ,  also known as Automatic Repeat Request, is a error-controll method for data transomission that use acknowledgement and timeouts. It contains Stop-and-Wait ARQ and Continuous ARQ.
### Stop-and-Wait ARQ
**normal transport**

There has to launch a timer and wait for response as long as A sends message to B, then cancel it and send next message after receiving the response. 

**packet lost or error**

It is possible to lost packet in transimiting. So it need to retransmit the message if the timer is time-out untile receiving the response. That is why we need a data copy.

It may also have problems in transmiting even the other client receiving the message correctly. And the message will be abandoned and the receiver wait for another transimittion.

PS: Generally, the limit setted by timer is longer than the average of the RTT.

**ACK time-out or lost**

The client B may also have the problem of packet lost or time-out. In this case, the client need to retransmit. When client B got the same SYN flag, it will abandon the message and send the previous response untile receiving another SYN.

The response may arrive after the limit time, and client A will adjust wether git the same ACK, if true, anbandon it. 

The client has to wait for the ACK even in a good network, so the effectiveness of transimission is low, that is the shortcomings of this protocol.

### Continuous ARQ

The sender has a sending window in which all the data will be sended without the ACK in COntinuous ARQ. This can improve the effectiveness by cuting the waiting time comparing with the Stop-and-Wait ARQ.

### Cumulative Acknowledgement

The receiver will receive message with nonstop in Continuous ARQ. If it send the response immediately every time like the Stop-and-Wait ARQ, it may waste the resource too much. So the client B can send a ACK after receiving a sort of request, that is what we called Cumulative Acknowledgement. The ACK indicates that all the data before this flag had been received and the client A should send the next message.

But it is not so pecfect. Image that client A send a sort of message form segment 5 to segment 10 in Continuous ARQ, and the client B receive  all the segments successfully except segment 6. In this case, the client B has to send the ACK of 6 even though the segments after 7 had been received successfully which caused the waste of resource. In fact, this problem can be solved by Stack which will be introduced following.

## sliding window

We have mentioned sliding window above. Both ends maintain the windows, send window & receive window, in TCP.

The data in send window is that had been sended but without ACK and has not been send which could send.

![](https://user-gold-cdn.xitu.io/2018/5/5/1632f25c587ffd54?w=660&h=270&f=png&s=37109)

The size of the send window is determined by the rest size of the receive window. The response will carry the rest size of the current receive window, and when the receiver receives the response, it will set the size of the send  window by the value and the network. So the size of send window is changeable.

When the send end receive the response, it will slide the window.

![](https://user-gold-cdn.xitu.io/2018/5/5/1632f25cca99c8f4?w=660&h=210&f=png&s=24554)

Sliding window relasize the flow-controll. The receiver notify the sender the size of the data which can be handled, so it can handle the data successfully by this.


### Zero window

There may be no window in the other end through the transimission. In this case, the sender will stop sending data and launch the persistent timer which can send request to the receiver to ask for the window size. After trying some times, it may terminate the TCP connection. 

## Congestion Control

Congestion Control is different between the flow control. The later is used in receiver to ensure that it can handle the data in time. The former is used in network to avoid that too much data congeste the network and the network is overload.

There are four algorithms in Congestion control: Slow-start, Congestion Avoidance, Fast Retransmit and Fast Recovery.

### Slow-start

As the name suggests, Slow-start begins with a congestion windows size of 1,2,4 or 10 MSS. The value of the Congestion window will be increased to double with each ACK. By this, it can avoid sending more data than the network is capable of transimitting and causing network congestion.

Steps of Slow-start are as follows:
1. set the congestion windows size of 1 MSS at the begining of the connection.
2. double the value of the size after each RTT
3. when the value of the size reach the threshold, the Congestion Avoidance algorithms begins.

### Congestion Avoidance algorithms

It is more simple than Slow-start. The value of the congestion window will be  only increased by one each ACK. By this way, it can avoid causing network congestion by double the value and adjust the value to the best slowly.

TCP will treat it as network congestion when the timer is time-out in transmitting. It will do the follows immediately:

1. cut the current threshold of the congestion window to half
2. set the value of the congestion winodw 1 MSS
3. start the Congestion Avoidance algorithms

### Fast Retransmit

Fast Retransmit always appears with the Fast Recovery. Once the data of got by receiver is disordered, the receiver will only send a response with the last correct SYN (without the Sack). If the sender got three repeated ACK, it will start the fast retransmit immediately instead of waiting for the timer.

**The realization of TCP Taho**

+  cut the current threshold of the congestion window to half
+ set the value of the congestion winodw 1 MSS
+ re-start the Slow-start 

**the relazition of TCP Reno**

+ cut the congestion window to half
+ set the threshold same the size of the current congestion window
+ enter the stage of the Fast Recorvery (retransmit the packet, leave this stage once got a new ACK)
+ use Congestion Avoidance algorithms
 
### Fast Recovery (TCP New Reno)

TCP New Reno improved the defect of the previous TCP Reno. Before this, it will drop out once got a new ACK.

TCP sender will store the biggest queue number of three repeated ACK in TCP New Reno.

If a segment carries the message from 1 to 10 of the queue number which tha data in 3 and 7 is lost. Then the biggest queue number of this segment is 10. The sender will only got the ACK of 3. Then the data in 3 will  be retransmited. And the receiver accept it and send the ACK of 7. At this time, TCP knows that the receiver lost more than on packets and will continue to send the data of 7. The receiver accept it and send the ACK of 11. By now, the sender infers that the segment had been accepted successfully and will drop out the stage of the Fast Recovery. 

# HTTP
HTTP protocol is stateless, it does not store the status.
## Difference between POST & GET 
At first， we'll introduce something about idempotence and side-effects.
Side-effects means that operations can change the status of the resource on server. e.g: searching some resource is none-side-effects while registering does.

Idempotence means that the side-effects of N > 0 indentical requests is the same as for M > 0 indentical requests. e.g: register 10 accounts is same like 11, while change a article 10 times is different like 11.

Generally, Get is usually used in Idempotence and none-side-effects scenes while Post is used in side-effects and not idempotence scenes.

Technically:
* Get could cache the response while Post not
* Post is safer than get, because the params of Get is combined in url while it is in the request body in Post and  the browser will cache the resource got by Get. But the Post data also can be captured with tools.
* POST can transport more data by `request body`, GET can't
* Since form data is in the URL and URL length is restricted, the data transported by GET is restricted and the limit varies by browser and web server . But with POST, the form data is in request body, there is no limit of length.
* POST support more encoding types and without limition of data type.

## Common Status Code
**2XX success **
* 200 OK: the request from client had been handled correctly in server.
* 204 No content:  The server successfully processed the request and is not returning any content.
* 205 Reset Content: The server successfully processed the request, but is not returning any content. Unlike a 204 response, this response requires that the requester reset the document view.
* 206 Partial Content: The server is delivering only part of the resource (byte serving) due to a range header sent by the client.    

**3XX Redirection**
* 301 Moved Permanently: The resource had been moved to a new uri permanently. This and all future requests should be directed to the given uri.
* 302 Found: The resource had been moved to a new uri temporary. This request should redirected to the given new uri.
* 303 See other: The response to the request can be found under another uri in the response using the GET method.
* 304 Not Modified: It indicates that the resource has not been modified since the version specified by the request headers If-Modified-Since or If-None-Match. In such case, there is no need to retransmit the resource since the client has a previously download copy.
* 307 Temporary Redirect: In this case, the request will re redirected to a new uir for temporary, and future requests should still use the origin uri.

**4XX Client Errors**
* 400 Bad Request: The server will not or can not process the request duo to an appearant client error.
* 401 Unauthorized: When the authentication of the request is required and has failed or has not yet been provided.
* 403 Forbidden: The request is valid, but the server is refusing action. The user might not have the necessary permission for a resource, or may need an account of some sort.
* 404 Not Found: The requested resource could not be found in the server but may be avaiable in the future.

**5XX Server Errors**
* 500 Internal Server Error: The server encountered an error when processing a request.
* 501 Not Implemented: The server lacks the ability to fullfill the request.
* 503 Service Unavaiable: The server is currently unavaiable because it is overloaded or down for maintenance.

|     Common Fields     |                       Description                       |
| :---------------: | :----------------------------------------------: |
|   Cache-Control   |                  It tells caching mechanisms                 |
|    Connection     | type of connection that the browser prefers, e.g.  `keep-alive` |
|       Date        |                   the date and time that the message was sent                   |
|      Pragma       |                     message directives that may have various effects anywhere along the request-response chain                      |
|        Via        |                Informs the client of proxies through which the response was sent.             |
| Transfer-Encoding |                  the form of encoding used to safely transfer the entity to the user.                    |
|      Upgrade      |                ask the opposite domain to upgrade another protocol                |
|      Warning      |               a general warning about problems with the entity body.               |

|      Request Fields       |                Description                |
| :-----------------: | :--------------------------------: |
|       Accept        |        Media types that are acceptable for the response        |
|   Accept-Charset    |         character sets that are acceptable         |
|   Accept-Encoding   |      list of the acceptable encodings      |
|   Accept-Language   |        list of the acceptable languages        |
|       Expect        |        Indicates that particular server behaviors are required by the client        |
|        From         |           the email address of the user making the request           |
|        Host         |            The domain name of server and the TCP port number on which the server is listening.            |
|      If-Match       |          if the client supplied entity matches the same entity on the serve,r the request will be preformed.          |
|  If-Modified-Since  | Allows a 304 Not Modified to returned if the content is unchange（compare with the Date） |
|    If-None-Match    | Allows a 304 Not Modified to returned if the content is unchange（compare with the ETag） |
|     User-Agent      |             the `user agent string` of the user agent             |
|    Max-Forwards     |    limit the number of times the message can be forwarded through the proxies and the gateways    |
| Proxy-Authorization |      authorization credentials for connetcing a proxy     |
|        Range        |        request only part of an entity. Bytes are numbered from 0.        |
|       Referer       |    This is the address of the previous web page from which a link to the currently requested page was followed    |
|         TE          |            The transfer encoding the user agent is willing to accept. The same values as for the response header field Transfer-Encoding can be used.            |

|      Response Fields      |            Description            |
| :----------------: | :------------------------: |
|   Accept-Ranges    |   What partical content range types this server supports via `type serving`   |
|        Age         | The age the object has been in a proxy cache in seconds |
|        ETag        |          An identifier for a specific version of  a resource, often a message digest          |
|      Location      |    use to redirect to a new url   |
| Proxy-Authenticate |  request anthorization to access the proxy  |
|       Server       |         name of the server         |
|  WWW-Authenticate  |   Indicates the anthorization scheme that should be used to access the requested entity.   |

|     Entity Fields    |              Description              |
| :--------------: | :----------------------------: |
|      Allow       |      valid methods for a specified resource       |
| Content-Encoding |         the type of the encoding used on the data         |
| Content-Language |         the language used on the content         |
|  Content-Length  |       the length of the response body        |
| Content-Location |       an alternate location for the returned data       |
|   Content-MD5    | a Base64-encoded binary MD5 sum of the content of the response |
|  Content-Range   |         where in a full body message thispartical message belongs         |
|   Content-Type   |         the MIME type of the content         |
|     Expires      |         the date after which the response is considered stale         |
|  Last_modified   |        the last modified date of the requested object       |
PS: Something about cache has completed in other chapter. You can [read this one](../Performance/performance-ch.md#cache).

# HTTPS
HTTPS transfer the data by HTTP, and the data is encrypted by TLS protocol.
## TLS
TLS protocol is above the transimissin layer and below the application layer. The first time to use TLS to transfer data need RTT twice, and then we can reduce it to once by using Session Resumption.

There are two basic techniques for encrypting information: symmetric encryption and asymmetric encryption.

**symmetric encryption**

A secret key, which can be a number, a word, or just a string of random letters, and both sender and recipient know it, is applied to encryt and decrypt all the messages.

**asymmetric encryption**

There are two related keys -- a key pair in the asymmetric encryption. A public key is made freely avaiable to anyone. A second, private key is kept secret, so that only you know it. The message encrypted by public key can only be decrypted by private key. 

**TLS handshake**

![](https://user-gold-cdn.xitu.io/2018/5/12/1635260126b3a10c?w=1558&h=1006&f=webp&s=59424)

1. The client send a random value, along with the cryptographic information and the protocols needed.
2. The server generates a random value and sends it to the client, while acceps the client's random value. It alse sends its digital certificate according to the protocols and cipher suits that the client provided. It the server requires a digital certificate for the client authentication, the server sends a request.
3. The cilent verifies the server's digital certificate and then create another random value encrypted with the server's public key. If the server has requested a certificate from the client, the client sends it.
4. The server got the second random value from client and decrepty it with its private key. And both the server and the client have the three random value. So they can generate the session key and exchange data that are encrypted with the  session key laterly.

From the above, through the handshake, clinet and server communicate with  symmetric encryption. But considering of the performance, they use the asymmetric encryption to communicate with each other.

PS: ALl above is based on TLS/1.2. And in TLS/1.3, after esatablishing pthe first RTT, there is no need to esatablish another one to resume the session.

# HTTP/2

Compare with HTTP/1.x,ther is a substantial increase of web's performance in the HTTP/2.

We usually use sprite, tiny picture-inline, multiple-domain-names and so on to improve the performance. It is all because of that browser limit the number of HTTP connections with the same domain. Ff there is too much resources to download, all these resources need to queue. And if someone hit the limit, those behand it will need to waiting until all of the previous had been loaded. That is called head-of-line blocking. 

You can tell how much faster of HTTP/2 than HTTP/1.x by [this link](https://http2.akamai.com/demo).

![](https://user-gold-cdn.xitu.io/2018/5/12/163542ca61eaff17?w=929&h=512&f=png&s=245670)

You will find the  request queue is something like this in HTTP 1.x because of head-of-line blocking.

![](https://user-gold-cdn.xitu.io/2018/5/12/163542c96df8563d?w=518&h=642&f=png&s=72417)

But with the MultiPlexing in HTTP/2, you'll find this:

![](https://user-gold-cdn.xitu.io/2018/5/12/163542c9d3128c7a?w=900&h=616&f=png&s=71014)

## Binary Transport

This is the point of all the improvement of performance in HTTP/2. We transfer data by plain text in the previous versions of HTTP. But all the data transferd will be split and transported by binary with the new encoding.

![](https://user-gold-cdn.xitu.io/2018/5/12/163543c25e5e9f23?w=874&h=459&f=png&s=26320)

## MultiPlexing

There are two important concepts in HTTP/2: frame and stream.

+ Stream: A bidirectional flow of bytes within an established connection, which may carry one or more message.
+ Frame: The smallest unit of communication in HTTP/2, each containing a frame header, which at a minimum indentifiers the stream to which the frame belongs.

There is one or more stream in a single connection, so we are able to send more than one request, and the opposite domain can identifier which the request belongs to by the indentifiers in frame. By this, we can avoid the head-in-line blocking and improve the performance highly.

![](https://user-gold-cdn.xitu.io/2018/5/12/1635442531d3e5ee?w=494&h=138&f=png&s=9636)

In HTTP/1.x, we transfer data of header by plain text, and sometimes kilobytes more if HTTP cookie are being used.

HTTP/2 use HPACK to compress all headers to reduce the size of header. Besides, both the client and the server maintain and update an indexed list of previously seen header fields which is then used as a reference to efficiently encode previously transmitted values.  

## server push
In HTTP/2, the server can push resources to the client without the client having to request. Image that, somthing in the server is necessary for the client, so the server can push the associated resources ahead of time to reduce the delay time. By the way, we can also use `pre-fetch` if the client is compatible.

## QUIC

QUIC(Quick UDP Internet Connections) that desigend by google is an transport layer network protocol based on UDP. QUIC's main goal is to improve performance of connection-oriented web applications that are currently using TCP. 

+ Based on TCP, HTTP/2 supports multiplexing. But because of the retransimission mechanism of TCP, head-ofline blocking will occur even one packet failed.  QUIC supports the multiplexing and without this problem.
+ QUIC has its own encryption and it gives us 0 RTT UDP like behaviour.  By the way, TLS/1.3 provides, too.
+ retransmission support and forward error correction, if you only lose one packet, and you don't have to retransimit, you can use forward err coorrection to resume the lost packat.
  - QUIC can use forward error correction to reconstruct lost packets. A scheme similar to RAID systems using XOR operations is used for this purpose.
  - But it cannot reconstruct lost packets when multiple packets are lost within a group.

# DNS
The Domain Name System (DNS) match the IP address by given hostname.

The IP address which is composed of number and letter, is difficult for human to remember, so the hostname is created. You can treat the hostname as the alias of the IP address. The DNS is used to convert a hostname to its real name.

The process of DNS begins before TCP handshake, it is processed by the system. When you type `www.google.com` in the broser:
1. the OS query from the local cache first
2. query to the configured DNS servers by OS if there is no result in step1.
3. query to the root server, which can offer a server who can resolve all the top level domains such as `.com`
4. then query to the server specified by step3 and look up the second-level domain name `google`
5. the third level domain name liek `www` are configured by yourself.  You can set `www` to a IP address ,  and do the same thing to another.

All above is something about DNS Iterative Query, there has another way to query DNS: Recursive Query. The difference between of them is that the former do the query by browser while the latter does by the configured DNS servers and then transport the data got to the browser.

PS： DNS query is based on UDP.

# What happens when you navagte to a url
This is a classical problem in an interview. We can concatenate the topics all above in this theme.
1. Do the DNS query first, it will offer the most suitable IP address with the intelligent DNS parsing
2. and then is the TCP handshake, the application layer will deliver the data to transport layer where the TCP protocols will point out the ports of the both ends, and then transport the data to network layer. The IP protocols in network layer will determine the IP address and how to navigate to the router and then the packet will be packaged to the data frames. And at last is the physical transport.
3. After the TCP handshake is the TLS handshake, and then is the formally data transport. 
4. It is possiable to the data to go through the load balancing servers before it access to the server. The load balancing server will deliver the requests to the source servers and response with a HTML file.
5. When got the response, the browser will adjust the status code , it will containue parsing the file with the status code 200. And if get 400 or 500, it will throw an error. If there is 300 code , it will redirect to a new url. And there is also a redirection counter to avoiding too much redirection by throw an error.
6. The browser will parse the file,  decompression if the file type is with compression like gzip and the parse the file by the encoding type. 
7. After the successful parsing, the render flow will start formally. It will construct the DOM tree by HTML and construct the CSSOM if with css . If there is a `script` tag, it will adjust if with the `async` or `defer` attributes, the former will download and excute the JS file parallelly and the later will load the file first and wait to excute until the HTML has been parsed. If none of them, it will block the render engineer until the js file has been excuted. Download if there are JS files, with the HTTP/2 it may highly improve the effectivenss of pictures download.
8. The `DOMContentLoaded` event will be triggered after the initial HTMl has been loaded and parsed completely.
9. The Render tree will be constructed after the CSSOM and the DOM tree, in which the layout the page elements, styles and something else will be calculated.
10. In the process of construct the Render tree, the browser will call the GPU to paint, combine the layers and display the contents on the screen.



