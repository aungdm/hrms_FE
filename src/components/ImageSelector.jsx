import React, { useState } from "react";

const ImageSelector = ({ images }) => {
  const imagesLocal = [
    {
      id: 1,
      thumb:
        "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg",
      full: "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg",
    },
  ];

  const [selectedImage, setSelectedImage] = useState(images[0]);
  console.log(images, "imagessss");
  // Handler to change the selected image
  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  return (
    <div style={styles.container}>
      {images.length > 0 ? (
        <div style={styles.thumbnails}>
          {images.map((image) => (
            <div
            // style={{
            //   borderBottom:
            //     selectedImage.id === image.id ? "3px solid #6950E8" : "none",
            // }}
            >
              <img
                key={image.id}
                src={image}
                alt={`Thumbnail ${image.id}`}
                onClick={() => handleImageClick(image)}
                style={styles.thumbnail}
              />
            </div>
          ))}
        </div>
      ) : (
        <div style={styles.thumbnails}>
          {imagesLocal.map((image) => (
            <div
            // style={{
            //   borderBottom:
            //     selectedImage.id === image.id ? "3px solid #6950E8" : "none",
            // }}
            >
              <img
                key={image.id}
                src={image.thumb}
                alt={`Thumbnail ${image.id}`}
                onClick={() => handleImageClick(image)}
                style={styles.thumbnail}
              />
            </div>
          ))}
        </div>
      )}

      {/* Large Image */}
      <div style={styles.imageContainer}>
        {selectedImage ? (
          <img src={selectedImage} alt="Selected" style={styles.fullImage} />
        ) : (
          <img
            src="https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg"
            alt="Selected"
            style={styles.fullImage}
          />
        )}
      </div>
    </div>
  );
};

// Styles
const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    maxWidth: "800px",
    margin: "auto",
  },
  thumbnails: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  thumbnail: {
    width: "60px",
    height: "60px",
    objectFit: "cover",
    cursor: "pointer",
    borderRadius: "8px",
  },
  imageContainer: {
    flex: 1,
    textAlign: "center",
  },
  fullImage: {
    width: "100%",
    maxHeight: "300px",
    objectFit: "cover",
    borderRadius: "8px",
  },
};

export default ImageSelector;
