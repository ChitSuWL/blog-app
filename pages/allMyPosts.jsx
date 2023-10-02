import { API, Auth,Storage } from "aws-amplify";
import "../configureAmplify";
import { postsByUsername } from "@/src/graphql/queries";
import { useEffect, useState } from "react";
import { deletePost as deletePostMutation } from "@/src/graphql/mutations";
import Link from "next/link";

export default function AllMyPosts() {
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    fetchPosts();
    console.log(posts);
  }, []);

  async function fetchPosts() {
    let { username } = await Auth.currentAuthenticatedUser();
    const user = await Auth.currentAuthenticatedUser();
    username = `${user.attributes.sub}::${username}`;
    const postData = await API.graphql({
      query: postsByUsername,
      variables: { username },
      //authMode: "AMAZON_COGNITO_USER_POOLS",
    });
     const { items } = postData.data.postsByUsername;
     const postWithImages = await Promise.all(
      items.map(async (post) => {
        if (post.coverImage) {
          post.coverImage = await Storage.get(post.coverImage);
        }
        return post;
      })
    );

    setPosts(postWithImages);
    //setPosts(postData.data.postsByUsername.items);
  }
  async function DeletePost(id) {
    await API.graphql({
      query: deletePostMutation,
      variables: { input: { id } },
      authMode: "AMAZON_COGNITO_USER_POOLS",
    });
    fetchPosts();
  }
  return (
    <div>
      {posts.map((post, index) => (
        <div
          key={index}
          className="py-8 px-8 max-w-xxl mx-auto bg-white rounded-xl shadow-lg space-y-2 sm:py-1 sm:flex 
          sm:items-center sm:space-y-0 sm:space-x-6 mb-2"
        >
          <div className="text-center space-y-2 sm:text-left">
            <div className="space-y-0.5">
              <p className="text-lg text-black font-semibold">
                Title: {post.title}
              </p>
              <p className="text-lg text-black font-semibold">
                Content: {post.content}
              </p>
              <p>
                {post.coverImage && (
                  <img
                    src={post.coverImage}
                    className="w-36 h-36 bg-contain bg-center 
                 rounded-full sm:mx-0 sm:shrink-0"
                  />
                )}
              </p>
            </div>
            <div
              className="sm:py-4 sm:flex 
        sm:items-center sm:space-y-0 sm:space-x-1"
            >
              <p
                className="px-4 py-1 text-sm text-green-600 font-semibold rounded-full border border-purple-200 
    hover:text-white hover:bg-green-600 hover:border-transparent focus:outline-none 
    focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
              >
                <Link href={`/posts/${post.id}`}>View Post</Link>
              </p>
              <p
                className="px-4 py-1 text-sm text-purple-600 font-semibold rounded-full border border-purple-200 
    hover:text-white hover:bg-purple-600 hover:border-transparent focus:outline-none 
    focus:ring-2 focus:ring-purple-600 focus:ring-offset-2"
              >
                <Link href={`/edit-post/${post.id}`}>Edit Post</Link>
              </p>

              <button
                className="text-sm mr-4 text-red-500"
                onClick={() => DeletePost(post.id)}
              >
                Delete Post
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
