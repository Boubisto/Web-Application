class ProfileTitle extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            following: this.props.following,
            follower_no: this.props.follower_no
        }
    }

    follow_button_click() {
        const new_following_state = !this.state.following;
        // update the following status
        this.setState({
            following: new_following_state,
            follower_no: this.state.follower_no + (new_following_state ? 1 : -1)
        });
        // let the server know the following status

        const csrf_token = getCookie('csrftoken');
        fetch(`/follow-profile/${this.props.username}`, {
            method: 'PUT',
            body: JSON.stringify({
                following: new_following_state
            }),
            credentials: 'same-origin',
            headers: {"X-CSRFToken": csrf_token}
        }).then();
    }

    render () {
        return(
            [<div key="profile" className="row profile">
                <div className="col-8">
                    <h3>{this.props.username}</h3>
                </div>
            </div>,
            <div key="follow" className="row follow">
                <div className="col-8">
                    <p>
                        <strong>
                            {this.state.follower_no}
                        </strong>
                        &ensp;follower{this.state.follower_no!==1 ? 's' : ''}  &ensp;|
                        &ensp;<strong>{this.props.following_no}</strong>
                        &ensp; following</p>
                </div>
            </div>,
                this.props.following!==null && <div key="follow" className="row follow">
                    <div className="col-8">
                        <button onClick={this.follow_button_click.bind(this)}>
                            {this.state.following ? "Unfollow" : "Follow"}
                        </button>
                    </div>
                </div>
        ]
        )
    }
}

class CurrentTime extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            current_time: get_current_time()
        };
    }

    componentDidMount() {
        this.intervalID = setInterval(() => {
            this.setState({
                current_time: get_current_time()
            })
        }, 50)
    }

    componentWillUnmount() {
        clearInterval(this.intervalID);
    }

    render() {
        return (
            <p>{this.state.current_time}</p>
        )
    }


}

class EditablePost extends React.Component {

    constructor(props) {
        super(props);
        this.textAreaRef = React.createRef();
        this.state = {
            current_time: get_current_time(),
            post_content: ""
        };
    }

    componentDidMount() {
        setInterval(() => {
            this.setState({
                 current_time: get_current_time()
            })
        }, 1000)
    }

    typed = (event) => {
        this.setState({
            post_content: event.target.value
        });
        this.adjustTextAreaRows();
    };

    submitPost() {
        const content = this.state.post_content;
        let data = new FormData();
        data.append('content', content);
        data.append('csrfmiddlewaretoken', csrf_token);

        fetch('/post', {
            method: 'POST',
            body: data,
            credentials: 'same-origin'
        })
            .then(response => response.json())
            .then(result => {
                if ("success" in result) {
                    load_posts("all");
                    this.setState({
                        post_content: ""
                    });
                    this.adjustTextAreaRows(true);
                }

                if ("error" in result) {
                    console.log(result);
                }

            })
            .catch(error => {
                console.log(error);
            });
    }

    adjustTextAreaRows = (reset) => {
        setTimeout(() => {
            if (reset) {
                this.textAreaRef.current.rows = 2;
            }
            else {
                this.textAreaRef.current.rows = get_text_area_height(this.textAreaRef.current)
            }
            }, 20);

    };

    render() {
        const color_style = {backgroundColor: this.props.color};
        return(
            <div className="row">
                <div className="col-8" style={color_style}>
                    <div className="post">
                        <div className="row post">
                            <div className="col-6 author">
                                <p><a href={`/view-posts/${this.props.username}/`} style={{color: this.props.color}}>
                                    <strong>{this.props.username}</strong></a> says:</p>

                            </div>
                            <div className="col-6 time">
                                <CurrentTime/>
                            </div>
                        </div>
                        <div className="row post-body">
                            <div className="col-8 post">
                                <textarea placeholder="Write your post here...." style={color_style}
                                          value={this.state.post_content} onChange={this.typed} ref={this.textAreaRef}
                                          onFocus={this.adjustTextAreaRows}>

                                </textarea>
                            </div>
                        </div>
                        <div className="row post">
                            <button type="submit" style={color_style} onClick={this.submitPost.bind(this)}>
                                <span id="submit-button" style={{color: this.props.color}}>Post</span>
                            </button>
                        </div>
                    </div>


                </div>
            </div>
        );

    }
}

class Post extends React.Component {

    constructor(props) {
        super(props);
        this.textAreaRef = React.createRef();
        this.state = {
            liked: this.props.liked,
            likes: this.props.likes,
            text: this.props.text,
            editing: false,
            editing_text_content: "",
            animate: this.props.animate,
            fade_out: false
        };
    }
    likes_view() {

        if (logged_in_user==="") {
            // nobody is logged in. Do nothing!
            document.querySelector('#log-in-button').style.color = 'red';
            document.querySelector('#log-in-button').style.fontWeight = 'bolder';
            setTimeout(() => {
                document.querySelector('#log-in-button').style.color = 'blue';
                document.querySelector('#log-in-button').style.fontWeight = 'inherit';
            }, 1000 );
            return
        }

        const new_liked_state = !this.state.liked;
        // update the like
        this.setState({
            liked: new_liked_state,
            likes: this.state.likes + (new_liked_state ? +1 : -1)
        });


        const csrf_token = getCookie('csrftoken');
        fetch(`/like-post/${this.props.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                liked: new_liked_state
            }),
            credentials: 'same-origin',
            headers: {"X-CSRFToken": csrf_token}
        }).then();

    };

    edit_post() {
        this.setState({
            editing: true,
            editing_text_content: this.state.text
        });
    }

    adjustTextAreaRows = () => {
        setTimeout(()=> this.textAreaRef.current.rows = get_text_area_height(this.textAreaRef.current), 20);

    };

    typed = (event) => {
        this.setState({
            editing_text_content: event.target.value
        });
        this.adjustTextAreaRows();

    };

    save_changes() {
        // if something changed
        if (this.state.text === this.state.editing_text_content) {
            this.unfocused_box();
            return
        }

        // update on page
        this.setState({
            editing: false,
            text: this.state.editing_text_content,
            // animate: true,
            fade_out: true
        });

        // Update on server
        const csrf_token = getCookie('csrftoken');
        fetch(`/update-post/${this.props.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                content: this.state.editing_text_content
            }),
            credentials: 'same-origin',
            headers: {"X-CSRFToken": csrf_token}
        }).then();



    }

    unfocused_box() {
        this.setState({
            editing: false
        });
    }


    animate_end() {
        if (this.state.fade_out && !this.state.animate) {
            this.setState(
                {
                    animate: true,
                    fade_out: false
                }
            );
            load_posts(latest_which_post);

        }
        else if (!this.state.fade_out && this.state.animate) {
            this.setState(
                {
                    animate: false,
                    fade_out: false
                }
            )
        }


    }

    render() {
        const color_style={backgroundColor: this.props.color};
        return (
            <div className="row">
                <div className={`col-8 col-md-6 offset-md-2 post 
                ${this.state.animate ? "post-animate" : ""} ${this.state.fade_out ? "fade-out" : ""}`} style={color_style} onAnimationEnd={this.animate_end.bind(this)}>
                    <div className="post-content container">
                        <div className="row post">
                            <div className="col-6 author">
                                <p><a href={`/view-posts/${this.props.author}/`} style={{color: this.props.color}}>
                                    <strong>{this.props.author}</strong></a> says:</p>
                            </div>
                            <div className="col-6 time">
                                {this.state.editing ?
                                    <CurrentTime/>
                                    :
                                    <p>{this.props.time}</p>
                                }
                            </div>
                        </div>
                        <div className="row post">

                            {this.state.editing ?
                                <div className="col-8 post">
                                    <textarea placeholder="Edit your post here..."
                                              style={color_style}
                                              value={this.state.editing_text_content} onChange={this.typed} autoFocus ref={this.textAreaRef} onFocus={this.adjustTextAreaRows}>

                                    </textarea>
                                </div>
                                :
                                <div className="col-8 post">
                                    <p>{this.state.text}</p>
                                </div>

                            }

                        </div>
                        <div className="row likes">
                            <div className="col-auto">
                                <div className={` ${this.state.liked ? "liked" : "not-liked"}`}
                                     style={this.state.liked ? {} : color_style} onClick={this.likes_view.bind(this)}>

                                </div>
                            </div>
                            <div className="col likes">
                                <p ><strong>{this.state.likes}</strong> like{this.state.likes!==1 ? 's' : '' }</p>
                            </div>
                            {logged_in_user===this.props.author &&
                                <div className="col edit">
                                    {this.state.editing ?
                                        <p><button className="edit-post"
                                                 onClick={this.save_changes.bind(this)}>Save</button>
                                            &nbsp; &nbsp;
                                            <button className="edit-post"
                                                  onClick={this.unfocused_box.bind(this)}>Cancel</button>
                                        </p>
                                        :
                                        <p><button className="edit-post"
                                                 onClick={this.edit_post.bind(this)}>Edit post</button></p>
                                    }
                                </div>
                            }
                        </div>
                    </div>


                </div>
            </div>
        );
    }
}

class PaginationNav extends React.Component {
    render() {
        const prev_button = this.props.page_number === 1
            ?
            <li className="page-item disabled">
                <a className="page-link" href="#" tabIndex="-1">Previous</a>
            </li>
            :
            <li className="page-item">
                <a className="page-link" href={`/view-posts/${this.props.which_posts}/${this.props.page_number-1}`}>Previous</a>
            </li>;

        const number_buttons = [];
        for (let i = 1; i<= this.props.upper_page_limit; i++) {
            number_buttons.push(
                <li className={`page-item ${this.props.page_number===i ? 'active' : ''}`} key={i}>
                    <a className="page-link" href={`/view-posts/${this.props.which_posts}/${i}`}>{i}</a>
                </li>
            )
        }

        const next_button = this.props.page_number < this.props.upper_page_limit
            ?
            <li className="page-item">
                <a className="page-link" href={`/view-posts/${this.props.which_posts}/${this.props.page_number + 1}`}>
                    Next
                </a>
            </li>
            :
            <li className="page-item disabled">
                <a className="page-link" href="#" tabIndex="-1">Next</a>
            </li>;
        return (
            <nav aria-label="navigation for page number of posts displayed" id="paginator_navigator">
                <ul className="pagination justify-content-center">
                    {prev_button}
                    {number_buttons}
                    {next_button}
                </ul>
            </nav>
        )
    }
}
class App extends React.Component {


    render() {
        const posts = this.props.posts;
        const all_posts = posts.length > 0 ? posts.map(post => <Post text={post.content} key={post.id} author={post.author}
                                                       time={post.timestamp} likes={post.likes} liked={post.liked}
                                                                     color={post.color} id={post.id}
                                                                     animate={this.props.animate_post_ids.includes(post.id)}/>) :
            <p id="follow-message">
                Follow someone first
            </p>;
        const editable_post = this.props.include_editable_post && <EditablePost username={this.props.editable_post_info.username}
                                                                          color={this.props.editable_post_info.color}/>;

        const profile_info = this.props.include_profile &&
            <ProfileTitle username={this.props.profile_info.username} follower_no={this.props.profile_info.follower_no}
                          following_no={this.props.profile_info.following_no} following={this.props.profile_info.following}/>;

        const pagination_nav = <PaginationNav page_number={this.props.page_number}
                                              upper_page_limit={this.props.upper_page_limit}
                                              which_posts={this.props.which_posts} />;
        return (
            <div className="container">
                {profile_info}
                {editable_post}
                {all_posts}
                {pagination_nav}
            </div>
        );
    }
}

let previous_post_ids = [];
let current_post_ids = [];
let logged_in_user = "";
let latest_which_post = "";

function load_posts(which_posts, page_number) {
    latest_which_post = which_posts;
    if (page_number===undefined) page_number = 1;
    const include_profile = which_posts !== "all" && which_posts !== "following";

    Promise.all(
        [
            fetch(`/posts/${which_posts}/${page_number}`).then(response=>response.json()),
            fetch('/get-username').then(response=>response.json()),
            include_profile && fetch(`/get-profile-info/${which_posts}`).then(response => response.json())
        ])
        .then(all_responses => {
            const [posts_info, editable_post_info, profile_info] = all_responses;

            logged_in_user = editable_post_info.username;

            if (include_profile && logged_in_user===profile_info.username) profile_info.following = null;


            const posts = posts_info.posts;
            const upper_page_limit = posts_info.upper_page_limit;
            current_post_ids = (posts.map(post => post.id));
            const animate_post_ids = previous_post_ids.length!==0 ?
                current_post_ids.filter(id=> !previous_post_ids.includes(id)) : [];

            previous_post_ids = current_post_ids;






            ReactDOM.render(<App posts={posts}
                             include_editable_post={which_posts==="all" && editable_post_info.username!==""}
                             editable_post_info={editable_post_info}
                             include_profile={include_profile}
                             profile_info={profile_info}
                             animate_post_ids={animate_post_ids} page_number={page_number} upper_page_limit={upper_page_limit}
                                 which_posts={which_posts}
            />,
            document.querySelector("#app"));

    })
        .catch(error => {
            console.log(error);
            if (which_posts !== "all") load_posts("all");
        });


    const page_title = which_posts==="all" ? "All posts" : which_posts==="following" ? "Posts by people you follow" : `Posts by ${which_posts}`;
    document.querySelector('title').innerHTML = `Network - ${page_title}`;



}


function get_current_time() {
    return new Date().toLocaleTimeString([], {month: 'short', day: 'numeric', hour: 'numeric',
        minute: '2-digit', second: '2-digit', timeZone: "EST"})

}

function first_load() {
    load_posts(which_posts_to_load, page_number_requested);
}


first_load();

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        let cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function get_text_area_height(text_area_ref) {
    const taLineHeight = 25; // This should match the line-height in the CSS
    const taHeight = text_area_ref.scrollHeight; // Get the scroll height of the textarea
    return Math.floor(taHeight / taLineHeight);
}

//Ressources used
//Stackoverflow and w3Schools