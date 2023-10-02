import { API, Storage } from "aws-amplify";
import ReactMarkdown from "react-markdown";
import "../../configureAmplify";
import { listPosts, getPost } from "@/src/graphql/queries";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { createComment } from "@/src/graphql/mutations";
import { v4 as uuid } from "uuid";
import dynamic from "next/dynamic";
const SimpleMDE = dynamic(() => import("react-simplemde-editor"), {
  ssr: false,
});

const initialState = { message: "" };

export default function Post({ post }) {
  console.log("this is log: " + post.id);
  const [coverImage, setCoverImage] = useState(null);
  const [comment, setComment] = useState(initialState);
  const [showMe, setShowMe] = useState(false);
  const router = useRouter();

  const { message } = comment;
  function toggle() {
    setShowMe(!showMe);
  }
  useEffect(() => {
    updateCoverImage();
  }, []);
  async function updateCoverImage() {
    if (post.coverImage) {
      const imageKey = await Storage.get(post.coverImage);
      setCoverImage(imageKey);
    }
  }

  if (router.isFallback) {
    return <div>Loading...</div>;
  }
  async function createTheComment() {
    if (!message) return;
    const id = uuid();
    comment.id = id;
    try {
      await API.graphql({
        query: createComment,
        variables: { input: comment },
        authMode: "AMAZON_COGNITO_USER_POOLS",
      });
    } catch (error) {
      console.log(error);
    }
    router.push("/allMyPosts");
  }
  return (
    <div>
      <h3 className="mt-4 font-semibold tracing-wide">Post details</h3>
      <h1 className="text-3xl mt-4 font-semibold tracing-wide">
        Title: {post.title}
      </h1>
      <h1 className="text-3xl mt-4 font-semibold tracing-wide">
        Content: {post.content}
      </h1>
      <br></br>
      <p>
        Created by: {post.username} at {post.createdAt}{" "}
      </p>
      {coverImage && <img src={coverImage} className="my-4" />}
      <div>
        <button
          type="button"
          className="mb-4 bg-green-600 text-white
      font-semibold px-8 py-2 rounded-lg"
          onClick={toggle}
        >
          Write a comment
        </button>
        {
          <div style={{ display: showMe ? "block" : "none" }}>
            <SimpleMDE
              value={comment.message}
              placeholder="Write your comment...."
              onChange={(value) =>
                setComment({ ...comment, message: value, postID: post.id })
              }
            />
            <button
              onClick={createTheComment}
              type="button"
              className="mb-4 bg-green-600 text-white
              font-semibold px-8 py-2 rounded-lg"
            >
              Save
            </button>
          </div>
        }
      </div>
    </div>
  );
}
export async function getStaticPaths() {
  const postData = await API.graphql({
    query: listPosts,
  });
  const paths = postData.data.listPosts.items.map((post) => ({
    params: {
      id: post.id,
    },
  }));
  return {
    paths,
    fallback: true,
  };
}
export async function getStaticProps({ params }) {
  const { id } = params;
  const postData = await API.graphql({
    query: getPost,
    variables: { id },
  });
  return {
    props: {
      post: postData.data.getPost,
    },
    revalidate: 1,
  };
}
