import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { updateWishlistName, generatePdf } from "./services/apiService";
import "./Portfolios.css";

const Portfolioslist = () => {
  const [groupedPosts, setGroupedPosts] = useState([]);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [newWishlistName, setNewWishlistName] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Extract portfolio data from location state with proper fallbacks
  const { portfolioId, wishlistName = "", wishlistItems = [] } = location.state || {};
  const [wishlistTitle, setWishlistTitle] = useState(wishlistName);

  useEffect(() => {
    if (!wishlistItems || wishlistItems.length === 0) {
      setError("Your Portfolio is empty");
      setGroupedPosts([]); // Explicitly set empty array
      return;
    }

    try {
      const categorizedPosts = wishlistItems.reduce((acc, post) => {
        const parentCategory = post.parent_category_name || "Uncategorized";
        const parentCategoryOrder = post.parent_category_order || 9999;
        const subcategory = post.subcategory_name || "Other";
        const subcategoryOrder = post.subcategory_order || 9999;
        const category = post.category_name || "Other";
        const categoryOrder = post.category_order || 9999;

        if (!acc[parentCategory]) {
          acc[parentCategory] = { 
            order: parentCategoryOrder, 
            subcategories: {} 
          };
        }

        if (!acc[parentCategory].subcategories[subcategory]) {
          acc[parentCategory].subcategories[subcategory] = { 
            order: subcategoryOrder, 
            categories: {} 
          };
        }

        if (!acc[parentCategory].subcategories[subcategory].categories[category]) {
          acc[parentCategory].subcategories[subcategory].categories[category] = { 
            order: categoryOrder, 
            posts: [] 
          };
        }

        acc[parentCategory].subcategories[subcategory].categories[category].posts.push(post);
        return acc;
      }, {});

      // Convert object to sorted array with proper null checks
      const sortedData = Object.entries(categorizedPosts)
        .sort(([, a], [, b]) => (a?.order || 0) - (b?.order || 0))
        .map(([parentCategory, parentData]) => {
          const subcategories = parentData?.subcategories ? Object.entries(parentData.subcategories) : [];
          
          const sortedSubcategories = subcategories
            .sort(([, a], [, b]) => (a?.order || 0) - (b?.order || 0))
            .map(([subcategory, subcatData], subcatIndex) => {
              const categories = subcatData?.categories ? Object.entries(subcatData.categories) : [];
              
              const sortedCategories = categories
                .sort(([, a], [, b]) => (a?.order || 0) - (b?.order || 0))
                .map(([category, catData], catIndex) => ({
                  category,
                  posts: catData?.posts?.map((post, i) => ({ 
                    ...post, 
                    displayIndex: i + 1 
                  })) || [],
                  categoryPrefix: String.fromCharCode(97 + catIndex) // a, b, c
                }));
              
              return {
                subcategory,
                categories: sortedCategories,
                subcategoryPrefix: String.fromCharCode(65 + subcatIndex) // A, B, C
              };
            });
          
          return {
            parentCategory,
            subcategories: sortedSubcategories,
          };
        });

      setGroupedPosts(sortedData);
    } catch (error) {
      console.error("Error processing wishlist items:", error);
      setError("Failed to organize portfolio items");
      setGroupedPosts([]);
    }
  }, [wishlistItems]);

  const handleBackClick = () => {
    navigate("/portfolios");
  };

  const handleCardClick = (post) => {
    console.log("Navigating with:", post);
  
    if (!post.slug) {
      console.error("Slug is missing for the post object", post);
    } else {
      navigate(`/portfolios/${post.slug}`, {
        state: {
          portfolioId,
          wishlistName,
          wishlistItems,
          category: post.category_name,
          parentCategory: post.parent_category_name,
        },
      });
    }
  };  
  
  const handleDownloadPDF = async () => {
    try {
      const productIds = wishlistItems.map(item => item.post_id);

      if (productIds.length === 0) {
        setError("No valid product IDs found.");
        return;
      }
  
      const response = await generatePdf(productIds);
  
      if (response && response.data) {
        const blob = new Blob([response.data], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        const filename = `Product_Catalog_${Date.now()}.pdf`;
  
        a.href = url;
        a.setAttribute("download", filename);
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        throw new Error("PDF generation failed. No data returned.");
      }
    } catch (err) {
      console.error("Error generating PDF:", err);
      setError("Failed to download PDF.");
    }
  };  

  // Handle Wishlist Name Edit
  const handleEditClick = () => {
    setIsEditing(true);
    setNewWishlistName(wishlistTitle);
  };

  const handleSaveClick = async () => {
    try {
      const response = await updateWishlistName(portfolioId, newWishlistName);
  
      if (response.status === 200) {
        setWishlistTitle(newWishlistName);
        setIsEditing(false);
        setNewWishlistName(""); // Reset input field
        setError(""); // Clear previous errors
      }
    } catch (error) {
      console.error("Error updating wishlist name:", error);
  
      if (error.response && error.response.status === 422) {
        setError(error.response.data.message || "Portfolio name already exists.");
      } else {
        setError("An error occurred while updating.");
      }
    }
  };  

  return (
    <div className="main_menu_wrapper container-fluid">
      <div className="d-flex justify-content-between align-items-center">
        <div className="backbtn">
          <button onClick={handleBackClick}>
            <i className="fa fa-arrow-left"></i>
          </button>
        </div>



        <div>
          <button className="pdf_btn" onClick={handleDownloadPDF}>
            <i className="fa fa-download"></i> Save PDF
          </button>
        </div>
      </div>

      <div className="wishlist-name text-center flex-grow-1">
          <h3 className="mb-0 mt-3 text-light">
            {wishlistTitle}
            <button className="btn btn-sm ml-2" onClick={handleEditClick}>
              <i className="fa fa-edit text-white"></i>
            </button>
          </h3>
        </div>
        
      {/* Edit Name Modal */}
      {isEditing && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h5>Edit Portfolio Name</h5>
            
            {/* Display Error Inside Pop-up */}
            {error && <div className="alert alert-danger">{error}</div>}

            <input
              type="text"
              value={newWishlistName}
              onChange={(e) => setNewWishlistName(e.target.value)}
              className="form-control"
            />

            <div className="modal-buttons mt-3">
              <button className="btn btn-danger" onClick={handleSaveClick}>
                Save
              </button>
              <button className="btn btn-dark ml-2" onClick={() => { setIsEditing(false); setError(""); }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

<div className="portfoiliolist container mt-4">
        {error && <div className="alert alert-warning">{error}</div>}

        {/* Add null check before mapping */}
        {Array.isArray(groupedPosts) && groupedPosts.map(({ parentCategory, subcategories = [] }) => (
          <div key={parentCategory} className="category-section mb-4">
            {parentCategory !== "Uncategorized" && (
              <h3 className="parent-category font-weight-bold">
                {parentCategory}
              </h3>
            )}

            {subcategories.map(({ subcategory, categories = [], subcategoryPrefix }) => (
              <div key={`${parentCategory}-${subcategory}`} className="sub-category mb-3 ml-3">
                <h5 className="subcategory-name">
                  {subcategoryPrefix}. {subcategory}
                </h5>

                {categories.map(({ category, posts = [], categoryPrefix }) => (
                  <div key={`${parentCategory}-${subcategory}-${category}`} className="category ml-4 mb-3">
                    <p className="category-name mb-2">
                      {categoryPrefix}. {category}
                    </p>
                    
                    <div className="posts ml-4">
                      {posts.map((post) => (
                        <div
                          className="mb-4"
                          key={post.post_id}
                          onClick={() => handleCardClick(post)}
                        >
                          <div className="card bg-dark text-white">
                            {post.image && (
                              <img
                                src={`https://api.ica.amigosserver.com/storage/${post.image}`}
                                className="card-img"
                                alt={post.title}
                              />
                            )}
                            <div className="card-img-overlay d-flex justify-content-between align-items-center">
                              <h5 className="card-title">{post.displayIndex}. {post.title}</h5>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Styles for modal */}
      <style>
        {`
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
          }

          .modal-content {
            background: white;
            padding: 20px;
            border-radius: 8px;
            width: 300px;
            text-align: center;
          }

          .modal-buttons {
            display: flex;
            justify-content: space-evenly;
          }

          .modal-buttons button {
            min-width: 80px;
          }
          .parent-category {
            font-weight: bold;
            font-size: 1.5rem;
          }

          .category-name {
            font-weight: 500;
          }
        `}
      </style>
    </div>
  );
};

export default Portfolioslist;
